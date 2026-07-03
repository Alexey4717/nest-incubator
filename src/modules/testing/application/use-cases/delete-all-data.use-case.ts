import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';

import { CoreConfig } from '@/shared/core/core.config';
import { IUseCase } from '@/shared/types/use-case';

import { TestingRepository } from '../../infrastructure/testing.repository.mongodb';

@Injectable()
export class DeleteAllDataUseCase implements IUseCase<void, boolean> {
  constructor(
    private readonly testingRepository: TestingRepository,
    private readonly coreConfig: CoreConfig,
    @InjectThrottlerStorage() private readonly throttlerStorage: ThrottlerStorage,
  ) {}

  async execute(): Promise<boolean> {
    const result = await this.testingRepository.deleteAllData();

    if (this.coreConfig.isTesting) {
      for (const key of Object.keys(this.throttlerStorage.storage)) {
        delete this.throttlerStorage.storage[key];
      }
    }

    return result;
  }
}
