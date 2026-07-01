import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { TestingRepository } from '../../infrastructure/testing.repository.mongodb';

@Injectable()
export class DeleteAllDataUseCase implements IUseCase<void, boolean> {
  constructor(private readonly testingRepository: TestingRepository) {}

  async execute(): Promise<boolean> {
    return this.testingRepository.deleteAllData();
  }
}
