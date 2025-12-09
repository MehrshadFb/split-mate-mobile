// src/services/api.ts
// Simplified API client for receipt scanning

import axios, { AxiosInstance } from "axios";

// Use environment variable for API base URL
// In development: http://localhost:3000
// In production: https://api.splitmate.app
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface UploadError {
  message: string;
  retryable: boolean;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 90000, // 90 second total timeout (upload + processing)
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Upload receipt images and wait for processing
   * Returns the scanned items or throws an error
   *
   * Edge cases handled:
   * - Server down (network error)
   * - Server timeout
   * - Gemini API failure
   * - Invalid image (not a receipt)
   * - Processing errors
   */
  async uploadReceipts(
    images: Array<{
      uri: string;
      fileName: string;
      mimeType: string;
    }>
  ): Promise<ReceiptItem[]> {
    try {
      // Step 1: Upload image(s) to server
      const formData = new FormData();

      images.forEach((image) => {
        // @ts-ignore - React Native FormData accepts file objects differently
        formData.append("receipt", {
          uri: image.uri,
          type: image.mimeType,
          name: image.fileName,
        });
      });

      const uploadResponse = await this.client.post<{
        success: boolean;
        data: {
          scanJobId: string;
          status: string;
          message: string;
        };
      }>("/api/scan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!uploadResponse.data.success || !uploadResponse.data.data.scanJobId) {
        throw new Error("Failed to upload receipt");
      }

      const scanJobId = uploadResponse.data.data.scanJobId;

      // Step 2: Poll for results (max 60 seconds, every 2 seconds)
      const maxPolls = 30; // 30 polls * 2 seconds = 60 seconds
      let pollCount = 0;

      while (pollCount < maxPolls) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        pollCount++;

        const statusResponse = await this.client.get<{
          success: boolean;
          data: {
            status: "queued" | "scanning" | "scanned" | "failed";
            result?: {
              items: ReceiptItem[];
            };
            error?: {
              code: string;
              message: string;
            };
          };
        }>(`/api/scan/${scanJobId}`);

        const { status, result, error } = statusResponse.data.data;

        if (status === "scanned" && result?.items) {
          // Success! Return the items
          return result.items;
        } else if (status === "failed") {
          // Gemini failed to process the image
          const errorMessage = error?.message || "Failed to read receipt";

          // Check if it's a Gemini-specific error
          if (error?.code === "GEMINI_API_ERROR") {
            throw {
              message:
                "AI service is currently unavailable. Please try again later.",
              retryable: true,
            } as UploadError;
          } else if (error?.code === "INVALID_RECEIPT") {
            throw {
              message:
                "This doesn't appear to be a valid receipt. Please try another image.",
              retryable: false,
            } as UploadError;
          } else {
            throw {
              message: errorMessage,
              retryable: true,
            } as UploadError;
          }
        }
        // Otherwise keep polling (status is "queued" or "scanning")
      }

      // Timeout - took too long
      throw {
        message: "Processing is taking longer than expected. Please try again.",
        retryable: true,
      } as UploadError;
    } catch (error: any) {
      // Handle different error types

      // If it's already our custom error, re-throw it
      if (error.message && error.retryable !== undefined) {
        throw error;
      }

      // Network errors (server down, no internet)
      if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
        throw {
          message:
            "Cannot connect to server. Please check your internet connection.",
          retryable: true,
        } as UploadError;
      }

      // Timeout
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw {
          message: "Request timed out. Please try again.",
          retryable: true,
        } as UploadError;
      }

      // Server errors (5xx)
      if (error.response?.status >= 500) {
        throw {
          message: "Server error. Please try again later.",
          retryable: true,
        } as UploadError;
      }

      // Client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw {
          message:
            error.response?.data?.message ||
            "Invalid request. Please try again.",
          retryable: false,
        } as UploadError;
      }

      // Unknown error
      throw {
        message: "Something went wrong. Please try again.",
        retryable: true,
      } as UploadError;
    }
  }
}

export const apiService = new ApiService();
