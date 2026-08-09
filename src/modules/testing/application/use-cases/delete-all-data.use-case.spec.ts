import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';

import { TestingRepository } from '../../infrastructure/testing.repository';
import { DeleteAllDataUseCase } from './delete-all-data.use-case';

describe('DeleteAllDataUseCase', () => {
  let useCase: DeleteAllDataUseCase;
  let testingRepository: { deleteAllData: jest.Mock };
  let throttlerStorage: {
    timeoutIds: ReturnType<typeof setTimeout>[];
    storage: Record<string, { totalHits: number; expiresAt: number }>;
  };

  beforeEach(async () => {
    testingRepository = { deleteAllData: jest.fn() };
    throttlerStorage = {
      timeoutIds: [],
      storage: {
        key1: { totalHits: 5, expiresAt: Date.now() + 1000 },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAllDataUseCase,
        { provide: TestingRepository, useValue: testingRepository },
        { provide: ThrottlerStorage, useValue: throttlerStorage },
      ],
    }).compile();

    useCase = module.get(DeleteAllDataUseCase);
  });

  it('deletes data, resets throttler storage and returns Result.ok', async () => {
    testingRepository.deleteAllData.mockResolvedValue(true);
    const timeoutId = setTimeout(() => undefined, 10_000);
    throttlerStorage.timeoutIds.push(timeoutId);

    const result = await useCase.execute();

    expect(result).toEqual({ status: ResultStatus.Success, data: null });
    expect(throttlerStorage.timeoutIds).toHaveLength(0);
    expect(throttlerStorage.storage.key1.totalHits).toBe(0);
    expect(throttlerStorage.storage.key1.expiresAt).toBeLessThanOrEqual(Date.now());
  });

  it('throws InternalServerError when delete fails', async () => {
    testingRepository.deleteAllData.mockResolvedValue(false);

    await expect(useCase.execute()).rejects.toThrow(DomainException);
    await expect(useCase.execute()).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });

  it('still succeeds when throttler reset throws', async () => {
    testingRepository.deleteAllData.mockResolvedValue(true);
    Object.defineProperty(throttlerStorage, 'storage', {
      get() {
        throw new Error('storage broken');
      },
    });

    await expect(useCase.execute()).resolves.toEqual({
      status: ResultStatus.Success,
      data: null,
    });
  });
});
