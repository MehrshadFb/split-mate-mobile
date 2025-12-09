// __tests__/retry.test.ts
// Unit tests for retry logic

import {
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
  retryWithBackoff,
} from "../src/shared/utils/retry";

describe("Retry Utility", () => {
  describe("calculateBackoffDelay", () => {
    it("should calculate correct delay with default config", () => {
      const delays = [
        calculateBackoffDelay(0),
        calculateBackoffDelay(1),
        calculateBackoffDelay(2),
        calculateBackoffDelay(3),
      ];

      // With jitter, delays should be in expected ranges
      expect(delays[0]).toBeGreaterThanOrEqual(250); // 500 * 0.5
      expect(delays[0]).toBeLessThanOrEqual(500);

      expect(delays[1]).toBeGreaterThanOrEqual(500); // 1000 * 0.5
      expect(delays[1]).toBeLessThanOrEqual(1000);

      expect(delays[2]).toBeGreaterThanOrEqual(1000); // 2000 * 0.5
      expect(delays[2]).toBeLessThanOrEqual(2000);
    });

    it("should cap delay at 30 seconds", () => {
      const delay = calculateBackoffDelay(10);
      expect(delay).toBeLessThanOrEqual(30000);
    });

    it("should not apply jitter when disabled", () => {
      const config = { ...DEFAULT_RETRY_CONFIG, jitter: false };
      const delay = calculateBackoffDelay(0, config);
      expect(delay).toBe(500); // Exactly initialDelayMs
    });
  });

  describe("retryWithBackoff", () => {
    it("should succeed on first attempt", async () => {
      const mockFn = jest.fn().mockResolvedValue("success");
      const result = await retryWithBackoff(mockFn);

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValue("success");

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("should call onRetry callback", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Fail"))
        .mockResolvedValue("success");

      const onRetry = jest.fn();

      await retryWithBackoff(mockFn, DEFAULT_RETRY_CONFIG, onRetry);

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it("should fail after max attempts", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Always fail"));

      await expect(retryWithBackoff(mockFn)).rejects.toThrow("Always fail");
      expect(mockFn).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.maxAttempts);
    });
  });
});
