import { AIProviderError } from "./errors.js";

export interface RetryOptions {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  /** Caps exponential backoff so a flaky provider can't stall for minutes. */
  readonly maxDelayMs: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 250,
  maxDelayMs: 4000,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryable(error: unknown): boolean {
  return error instanceof AIProviderError && error.recoverable;
}

/**
 * Runs `operation`, retrying with exponential backoff on recoverable
 * {@link AIProviderError}s (rate limits, transient network errors).
 * Non-recoverable errors (bad API key, invalid response) fail immediately
 * — retrying those would just waste calls and delay a useless failure.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }
      const backoff = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      await delay(backoff);
    }
  }
  // Unreachable: the loop above always either returns or throws.
  throw lastError;
}
