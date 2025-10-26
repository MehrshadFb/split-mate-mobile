// __tests__/errorHandling.test.ts
// Unit tests for error handling and user messages

import { createScanError, ErrorMessages } from "../src/utils/errors";

describe("Error Handling", () => {
  it("should create network error", () => {
    const error = createScanError({ message: "Network request failed" });

    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.userMessage).toBe(ErrorMessages.UPLOAD_NETWORK_FAIL);
    expect(error.retryable).toBe(true);
  });

  it("should create rate limit error", () => {
    const error = createScanError({ message: "Too many requests" }, 429);

    expect(error.code).toBe("RATE_LIMITED");
    expect(error.userMessage).toBe(ErrorMessages.RATE_LIMITED);
    expect(error.retryable).toBe(true);
  });

  it("should create server error", () => {
    const error = createScanError({ message: "Internal error" }, 500);

    expect(error.code).toBe("SERVER_ERROR");
    expect(error.userMessage).toBe(ErrorMessages.SERVER_ERROR);
    expect(error.retryable).toBe(true);
  });

  it("should create file too large error", () => {
    const error = createScanError({ message: "Payload too large" }, 413);

    expect(error.code).toBe("FILE_TOO_LARGE");
    expect(error.userMessage).toBe(ErrorMessages.FILE_TOO_LARGE);
    expect(error.retryable).toBe(false);
  });

  it("should create unsupported file error", () => {
    const error = createScanError({ message: "Unsupported media type" }, 415);

    expect(error.code).toBe("FILE_UNSUPPORTED");
    expect(error.userMessage).toBe(ErrorMessages.FILE_UNSUPPORTED);
    expect(error.retryable).toBe(false);
  });

  it("should create Gemini timeout error", () => {
    const error = createScanError({
      code: "GEMINI_TIMEOUT",
      message: "Timeout",
    });

    expect(error.code).toBe("GEMINI_TIMEOUT");
    expect(error.userMessage).toBe(ErrorMessages.GEMINI_TIMEOUT);
    expect(error.retryable).toBe(true);
  });

  it("should create parse failure error", () => {
    const error = createScanError({
      code: "PARSE_FAILED",
      message: "Parse failed",
    });

    expect(error.code).toBe("PARSE_FAILED");
    expect(error.userMessage).toBe(ErrorMessages.GEMINI_PARSE_FAIL);
    expect(error.retryable).toBe(false);
  });
});
