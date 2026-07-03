import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';

import { IUseCase } from '@/shared/types/use-case';

import { TestingRepository } from '../../infrastructure/testing.repository.mongodb';

@Injectable()
export class DeleteAllDataUseCase implements IUseCase<void, boolean> {
  constructor(
    private readonly testingRepository: TestingRepository,
    @InjectThrottlerStorage() private readonly throttlerStorage: ThrottlerStorage,
  ) {}

  async execute(): Promise<boolean> {
    const result = await this.testingRepository.deleteAllData();

    for (const key of Object.keys(this.throttlerStorage.storage)) {
      delete this.throttlerStorage.storage[key];
    }

    return result;
  }
}
