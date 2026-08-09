import { sleep } from '../utils/sleep';
import { isRetryableDbError } from './is-retryable-db-error';

export type RunWithTransactionRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

function computeDelayMs(attempt: number, baseDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const jitter = Math.random() * baseDelayMs;
  return exponential + jitter;
}

export async function runWithTransactionRetry<T>(
  fn: () => Promise<T>,
  options: RunWithTransactionRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 50;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableDbError(error) || attempt === maxAttempts) {
        throw error;
      }

      await sleep(computeDelayMs(attempt, baseDelayMs));
    }
  }

  throw lastError;
}
