import { useCallback, useState } from "react";
import {
  apiService,
  ReceiptItem,
  UploadError,
  UploadProgress,
} from "../../../shared/services/api";

export interface UploadImage {
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface UseUploadReturn {
  uploadReceipts: (images: UploadImage[]) => Promise<ReceiptItem[] | null>;
  isLoading: boolean;
  uploadProgress: UploadProgress | null;
  error: UploadError | null;
  clearError: () => void;
}

export function useUpload(): UseUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
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
      setUploadProgress(null);
      try {
        const items = await apiService.uploadReceipts(images, (progress) => {
          setUploadProgress(progress);
        });
        return items;
      } catch (err) {
        const uploadError = handleUploadError(err);
        setError(uploadError);
        return null;
      } finally {
        setIsLoading(false);
        setUploadProgress(null);
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
    uploadProgress,
    error,
    clearError,
  };
}
