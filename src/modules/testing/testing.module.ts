import { Module } from '@nestjs/common';

import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { TestingController } from './api/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository.mongodb';

@Module({
  imports: [MongooseModelsModule],
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
