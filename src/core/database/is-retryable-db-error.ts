import { QueryFailedError } from 'typeorm';

export const RETRYABLE_PG_ERROR_CODES = [
  '40P01', // deadlock_detected
  '40001', // serialization_failure
  '55P03', // lock_not_available
] as const;

const RETRYABLE_PG_CODES = new Set<string>(RETRYABLE_PG_ERROR_CODES);

export function isRetryableDbError(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const code = (error.driverError as { code?: string }).code;
  return code !== undefined && RETRYABLE_PG_CODES.has(code);
}
