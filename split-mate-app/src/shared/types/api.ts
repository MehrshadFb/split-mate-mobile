export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface ScanUploadResponse {
  success: boolean;
  data: {
    scanJobId: string;
    status: string;
    message: string;
  };
}

export interface ScanStatusResponse {
  success: boolean;
  data: {
    scanJobId: string;
    status: "queued" | "scanning" | "scanned" | "failed" | "retrying";
    progress?: number;
    result?: {
      items: {
        name: string;
        price: number;
      }[];
    };
    error?: {
      code: string;
      message: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
