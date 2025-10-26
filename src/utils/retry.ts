// src/utils/retry.ts
// Exponential backoff with jitter for robust retry logic

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  factor: number;
  jitter: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 4,
  initialDelayMs: 500,
  factor: 2,
  jitter: true,
};

/**
 * Calculate delay with exponential backoff and optional jitter
 * Formula: delay = initialDelay * (factor ^ attempt)
 * With jitter: delay = delay * (0.5 + random(0, 0.5))
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const { initialDelayMs, factor, jitter } = config;

  let delay = initialDelayMs * Math.pow(factor, attempt);

  if (jitter) {
    // Add jitter: randomize between 50% and 100% of calculated delay
    const jitterFactor = 0.5 + Math.random() * 0.5;
    delay = delay * jitterFactor;
  }

  // Cap at 30 seconds
  return Math.min(delay, 30000);
}

/**
 * Sleep utility for async/await
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.maxAttempts - 1) {
        const delay = calculateBackoffDelay(attempt, config);
        onRetry?.(attempt + 1, lastError);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
