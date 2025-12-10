// src/features/upload/hooks/useUpload.ts
// Custom hook for handling receipt upload operations

import { useCallback, useState } from "react";
import { apiService, ReceiptItem, UploadError } from "../../../shared/services/api";

export interface UploadImage {
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface UseUploadReturn {
  uploadReceipts: (images: UploadImage[]) => Promise<ReceiptItem[] | null>;
  isLoading: boolean;
  error: UploadError | null;
  clearError: () => void;
}


export function useUpload(): UseUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);

  const handleUploadError = useCallback((err: unknown): UploadError => {
    const defaultMessage = "Something went wrong. Please try again.";
    
    if (err && typeof err === "object" && "message" in err) {
      return {
        message: (err as any).message || defaultMessage,
        retryable: (err as any).retryable !== false, // Default to retryable
      };
    }
    
    return {
      message: defaultMessage,
      retryable: true,
    };
  }, []);

  const uploadReceipts = useCallback(
    async (images: UploadImage[]): Promise<ReceiptItem[] | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await apiService.uploadReceipts(images);
        return items;
      } catch (err) {
        const uploadError = handleUploadError(err);
        setError(uploadError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleUploadError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadReceipts,
    isLoading,
    error,
    clearError,
  };
}
