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

export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const { initialDelayMs, factor, jitter } = config;
  let delay = initialDelayMs * Math.pow(factor, attempt);
  if (jitter) {
    const jitterFactor = 0.5 + Math.random() * 0.5; // Add jitter: randomize between 50% and 100% of calculated delay
    delay = delay * jitterFactor;
  }
  return Math.min(delay, 30000); // Cap at 30 seconds
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
