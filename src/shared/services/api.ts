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

export type UploadStatus = "uploading" | "queued" | "scanning" | "scanned";

export interface UploadProgress {
  status: UploadStatus;
  current: number;
  total: number;
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
    images: {
      uri: string;
      fileName: string;
      mimeType: string;
    }[],
    onStatusChange?: (progress: UploadProgress) => void
  ): Promise<ReceiptItem[]> {
    try {
      const allItems: ReceiptItem[] = [];
      const totalImages = images.length;

      // Process each image sequentially
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const isLastImage = i === images.length - 1;
        const currentImageNumber = i + 1;

        // Step 1: Upload single image to server
        onStatusChange?.({
          status: "uploading",
          current: currentImageNumber,
          total: totalImages,
        });

        const formData = new FormData();

        // @ts-ignore - React Native FormData accepts file objects differently
        formData.append("receipt", {
          uri: image.uri,
          type: image.mimeType,
          name: image.fileName,
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

        if (
          !uploadResponse.data.success ||
          !uploadResponse.data.data.scanJobId
        ) {
          throw new Error("Failed to upload receipt");
        }

        const scanJobId = uploadResponse.data.data.scanJobId;

        // Step 2: Poll for results (max 60 seconds, every 2 seconds)
        const maxPolls = 30; // 30 polls * 2 seconds = 60 seconds
        let pollCount = 0;
        let scanSuccessful = false;

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

          // Update status for UI feedback
          if (status === "queued" || status === "scanning") {
            onStatusChange?.({
              status,
              current: currentImageNumber,
              total: totalImages,
            });
          }

          if (status === "scanned" && result?.items) {
            // Success! Add items to our collection
            allItems.push(...result.items);
            scanSuccessful = true;
            
            if (!isLastImage) {
              // Continue to next image
              break;
            } else {
              // Last image - return all items
              onStatusChange?.({
                status: "scanned",
                current: totalImages,
                total: totalImages,
              });
              return allItems;
            }
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

        // Only throw timeout error if scan didn't complete successfully
        if (!scanSuccessful) {
          throw {
            message: "Processing is taking longer than expected. Please try again.",
            retryable: true,
          } as UploadError;
        }
      }

      // If we get here, all images processed successfully
      return allItems;
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
