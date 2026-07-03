import { Module } from '@nestjs/common';

import { DatabaseConfig } from './database.config';
import { MongooseModelsModule } from './mongoose-models.module';
import { MongooseConfig } from './mongoose.config';

@Module({
  imports: [MongooseModelsModule],
  providers: [DatabaseConfig, MongooseConfig],
  exports: [DatabaseConfig, MongooseConfig, MongooseModelsModule],
})
export class DatabaseModule {}
