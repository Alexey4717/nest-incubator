import { QueryFailedError } from 'typeorm';

import { isRetryableDbError, RETRYABLE_PG_ERROR_CODES } from './is-retryable-db-error';
import { runWithTransactionRetry } from './run-with-transaction-retry';

function createQueryFailedError(code: string): QueryFailedError {
  return new QueryFailedError('SELECT 1', [], { code } as never);
}

describe('isRetryableDbError', () => {
  it.each(RETRYABLE_PG_ERROR_CODES)('returns true for retryable code %s', (code) => {
    expect(isRetryableDbError(createQueryFailedError(code))).toBe(true);
  });

  it('returns false for non-retryable QueryFailedError', () => {
    expect(isRetryableDbError(createQueryFailedError('23505'))).toBe(false);
  });

  it('returns false for non-QueryFailedError', () => {
    expect(isRetryableDbError(new Error('fail'))).toBe(false);
  });
});

describe('runWithTransactionRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    await expect(runWithTransactionRetry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error and succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(createQueryFailedError('40P01'))
      .mockResolvedValue('ok');

    const promise = runWithTransactionRetry(fn, { baseDelayMs: 50 });

    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-retryable error', async () => {
    const error = new Error('business');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(runWithTransactionRetry(fn)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after maxAttempts on persistent retryable error', async () => {
    const error = createQueryFailedError('40001');
    const fn = jest.fn().mockRejectedValue(error);

    const promise = runWithTransactionRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
    const assertion = expect(promise).rejects.toBe(error);

    await jest.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
