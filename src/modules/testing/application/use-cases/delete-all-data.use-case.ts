import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';

import { IUseCase } from '@/shared/types/use-case';

import { TestingRepository } from '../../infrastructure/testing.repository.mongodb';

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
    const storageService = this.throttlerStorage as ThrottlerStorageServiceLike;

    if (Array.isArray(storageService.timeoutIds)) {
      for (const timeoutId of storageService.timeoutIds) {
        clearTimeout(timeoutId);
      }
      storageService.timeoutIds.length = 0;
    }

    for (const key of Object.keys(this.throttlerStorage.storage)) {
      delete this.throttlerStorage.storage[key];
    }
  }
}
