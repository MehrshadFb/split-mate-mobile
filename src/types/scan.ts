// src/types/scan.ts
// Types for scan job status and lifecycle

export type ScanJobStatus =
  | "pending" // Queued for upload
  | "uploading" // Upload in progress
  | "queued" // Server received, awaiting Gemini
  | "scanning" // Gemini processing
  | "scanned" // Successfully parsed
  | "failed" // Failed after all retries
  | "retrying"; // Retry in progress

export interface ScanJob {
  id: string;
  status: ScanJobStatus;
  fileUri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  progress: number; // 0-100
  attempt: number;
  maxAttempts: number;
  scanJobId?: string; // Server-side scan job ID
  error?: ScanError;
  result?: ParsedScanResult;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedScanResult {
  items: Array<{
    name: string;
    price: number;
  }>;
}

export interface ScanError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
}

// Upload queue item - persisted to AsyncStorage
export interface QueuedUpload {
  id: string;
  fileUri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  attempt: number;
  nextRetryAt?: string;
  createdAt: string;
}
