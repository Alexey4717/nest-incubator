import { Module } from '@nestjs/common';

import { DatabaseConfig } from './database.config';
import { TypeOrmConfig } from './typeorm.config';

@Module({
  providers: [DatabaseConfig, TypeOrmConfig],
  exports: [DatabaseConfig, TypeOrmConfig],
})
export class DatabaseModule {}
