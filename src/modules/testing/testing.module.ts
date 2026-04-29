import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository.mongodb';
import { MongooseModelsModule } from '../database/mongoose-models.module';

@Module({
  imports: [MongooseModelsModule],
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
