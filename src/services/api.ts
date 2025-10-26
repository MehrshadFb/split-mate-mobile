// src/services/api.ts
// API client with axios and retry logic

import axios, { AxiosError, AxiosInstance, CancelTokenSource } from "axios";
import { ApiError, ScanStatusResponse, ScanUploadResponse } from "../types/api";
import { createScanError } from "../utils/errors";

// Use environment variable for API base URL
// In development: http://localhost:3000
// In production: https://api.splitmate.app
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class ApiService {
  private client: AxiosInstance;
  private uploadCancelTokens: Map<string, CancelTokenSource> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
          statusCode: error.response?.status || 0,
        };
        throw createScanError(apiError, error.response?.status);
      }
    );
  }

  /**
   * Upload receipt image to server for Gemini processing
   * Returns scanJobId immediately
   */
  async uploadReceipt(
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void
  ): Promise<ScanUploadResponse> {
    const formData = new FormData();

    // @ts-ignore - React Native FormData accepts file objects differently
    formData.append("receipt", {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    });

    // Create cancel token for this upload
    const cancelTokenSource = axios.CancelToken.source();
    const uploadId = `${Date.now()}-${fileName}`;
    this.uploadCancelTokens.set(uploadId, cancelTokenSource);

    try {
      const response = await this.client.post<ScanUploadResponse>(
        "/api/scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: cancelTokenSource.token,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress?.(progress);
            }
          },
        }
      );

      return response.data;
    } finally {
      this.uploadCancelTokens.delete(uploadId);
    }
  }

  /**
   * Cancel an ongoing upload
   */
  cancelUpload(uploadId: string): void {
    const cancelToken = this.uploadCancelTokens.get(uploadId);
    if (cancelToken) {
      cancelToken.cancel("Upload cancelled by user");
      this.uploadCancelTokens.delete(uploadId);
    }
  }

  /**
   * Poll scan job status
   * Client should poll this endpoint every 2-3 seconds while status is 'queued' or 'scanning'
   */
  async getScanStatus(scanJobId: string): Promise<ScanStatusResponse> {
    const response = await this.client.get<ScanStatusResponse>(
      `/api/scan/${scanJobId}`
    );
    return response.data;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/health");
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
