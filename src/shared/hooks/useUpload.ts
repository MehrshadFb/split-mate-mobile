// src/hooks/useUpload.ts
// Simplified upload hook - just handles loading state and errors

import { useState } from "react";
import { apiService, ReceiptItem, UploadError } from "../services/api";

export function useUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);

  /**
   * Upload receipts and wait for processing
   * Returns the scanned items or null if error
   */
  const uploadReceipts = async (
    images: Array<{
      uri: string;
      fileName: string;
      mimeType: string;
    }>
  ): Promise<ReceiptItem[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await apiService.uploadReceipts(images);
      return items;
    } catch (err: any) {
      const uploadError: UploadError = {
        message: err.message || "Something went wrong. Please try again.",
        retryable: err.retryable !== false, // Default to retryable
      };
      setError(uploadError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear the error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    uploadReceipts,
    isLoading,
    error,
    clearError,
  };
}
