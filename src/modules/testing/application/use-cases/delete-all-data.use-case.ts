import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';

import { IUseCase } from '@/shared/types/use-case';

import { TestingRepository } from '../../infrastructure/testing.repository';

type ThrottlerStorageServiceLike = ThrottlerStorage & {
  timeoutIds?: ReturnType<typeof setTimeout>[];
};

@Injectable()
export class DeleteAllDataUseCase implements IUseCase<void, boolean> {
  constructor(
    private readonly testingRepository: TestingRepository,
    @InjectThrottlerStorage() private readonly throttlerStorage: ThrottlerStorage,
  ) {}

  async execute(): Promise<boolean> {
    const result = await this.testingRepository.deleteAllData();
    this.resetThrottlerStorage();
    return result;
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
