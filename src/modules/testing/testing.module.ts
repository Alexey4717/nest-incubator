import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { TestingController } from './api/testing.controller';
import { DeleteAllDataHandler } from './application/commands/delete-all-data.command';
import { DeleteAllDataUseCase } from './application/use-cases/delete-all-data.use-case';
import { TestingRepository } from './infrastructure/testing.repository.mongodb';

const testingUseCases = [DeleteAllDataUseCase];

const testingCommandHandlers = [DeleteAllDataHandler];

@Module({
  imports: [CqrsModule, MongooseModelsModule],
  controllers: [TestingController],
  providers: [TestingRepository, ...testingUseCases, ...testingCommandHandlers],
})
export class TestingModule {}
