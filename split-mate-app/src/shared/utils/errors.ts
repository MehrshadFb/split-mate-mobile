import { ScanError } from "../types/scan";

export const ErrorMessages = {
  FILE_TOO_LARGE: "This file is too large. Try a file under 10 MB.",
  FILE_UNSUPPORTED:
    "This file isn't supported. Try a JPG, PNG, or PDF under 10 MB.",
  UPLOAD_NETWORK_FAIL: "Upload failed — Check connection.",
  GEMINI_TIMEOUT:
    "Scanning is taking longer than expected. We'll retry automatically.",
  GEMINI_PARSE_FAIL:
    "We couldn't extract invoice data automatically. Please verify or enter the key fields.",
  RATE_LIMITED: "Service busy — we'll resume automatically.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
};

export function createScanError(error: any, statusCode?: number): ScanError {
  // Network errors
  if (error.message === "Network request failed" || !statusCode) {
    return {
      code: "NETWORK_ERROR",
      message: error.message || "Network error",
      userMessage: ErrorMessages.UPLOAD_NETWORK_FAIL,
      retryable: true,
    };
  }
  // Rate limiting
  if (statusCode === 429) {
    return {
      code: "RATE_LIMITED",
      message: "Too many requests",
      userMessage: ErrorMessages.RATE_LIMITED,
      retryable: true,
    };
  }
  // Server errors (5xx)
  if (statusCode >= 500) {
    return {
      code: "SERVER_ERROR",
      message: error.message || "Server error",
      userMessage: ErrorMessages.SERVER_ERROR,
      retryable: true,
    };
  }
  // File validation errors (4xx)
  if (statusCode === 413) {
    return {
      code: "FILE_TOO_LARGE",
      message: "File too large",
      userMessage: ErrorMessages.FILE_TOO_LARGE,
      retryable: false,
    };
  }
  if (statusCode === 415) {
    return {
      code: "FILE_UNSUPPORTED",
      message: "Unsupported file type",
      userMessage: ErrorMessages.FILE_UNSUPPORTED,
      retryable: false,
    };
  }
  // Gemini validation errors
  if (error.code === "GEMINI_TIMEOUT") {
    return {
      code: "GEMINI_TIMEOUT",
      message: "Gemini processing timeout",
      userMessage: ErrorMessages.GEMINI_TIMEOUT,
      retryable: true,
    };
  }
  if (error.code === "PARSE_FAILED") {
    return {
      code: "PARSE_FAILED",
      message: "Failed to parse receipt",
      userMessage: ErrorMessages.GEMINI_PARSE_FAIL,
      retryable: false,
    };
  }
  // Default unknown error
  return {
    code: "UNKNOWN_ERROR",
    message: error.message || "Unknown error",
    userMessage: ErrorMessages.UNKNOWN_ERROR,
    retryable: false,
  };
}
