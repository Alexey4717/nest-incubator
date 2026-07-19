import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { TestingRepository } from '../../infrastructure/testing.repository';

type ThrottlerStorageServiceLike = ThrottlerStorage & {
  timeoutIds?: ReturnType<typeof setTimeout>[];
};

@Injectable()
export class DeleteAllDataUseCase implements IUseCase<void, ResultType<null>> {
  constructor(
    private readonly testingRepository: TestingRepository,
    @InjectThrottlerStorage() private readonly throttlerStorage: ThrottlerStorage,
  ) {}

  async execute(): Promise<ResultType<null>> {
    const deleted = await this.testingRepository.deleteAllData();
    if (!deleted) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    this.resetThrottlerStorage();
    return Result.ok(null);
  }

  private resetThrottlerStorage(): void {
    try {
      const storageService = this.throttlerStorage as ThrottlerStorageServiceLike;

      if (Array.isArray(storageService.timeoutIds)) {
        for (const timeoutId of storageService.timeoutIds) {
          clearTimeout(timeoutId);
        }
        storageService.timeoutIds.length = 0;
      }

      const storage = storageService.storage;
      if (!storage || typeof storage !== 'object') return;

      // reset in-place: delete ломает pending setTimeout в ThrottlerStorageService (crash на prod/Vercel)
      for (const key of Object.keys(storage)) {
        storage[key] = { totalHits: 0, expiresAt: Date.now() - 1 };
      }
    } catch {
      // сброс throttler не должен ломать очистку тестовых данных
    }
  }
}
