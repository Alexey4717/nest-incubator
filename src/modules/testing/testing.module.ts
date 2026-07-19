import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TestingController } from './api/testing.controller';
import { DeleteAllDataHandler } from './application/commands/delete-all-data.command';
import { DeleteAllDataUseCase } from './application/use-cases/delete-all-data.use-case';
import { TestingRepository } from './infrastructure/testing.repository';

const testingUseCases = [DeleteAllDataUseCase];

const testingCommandHandlers = [DeleteAllDataHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TestingController],
  providers: [TestingRepository, ...testingUseCases, ...testingCommandHandlers],
})
export class TestingModule {}
