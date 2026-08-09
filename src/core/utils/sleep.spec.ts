import { sleep } from './sleep';

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves after the given delay', async () => {
    const promise = sleep(300);
    let resolved = false;
    void promise.then(() => {
      resolved = true;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(299);
    await Promise.resolve();
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await expect(promise).resolves.toBeUndefined();
    expect(resolved).toBe(true);
  });
});
