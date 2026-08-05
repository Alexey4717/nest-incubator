import { Global, Module } from '@nestjs/common';

import { DatabaseConfig } from './database.config';
import { InternalIdResolver } from './internal-id.resolver';
import { TypeOrmConfig } from './typeorm.config';

@Global()
@Module({
  providers: [DatabaseConfig, TypeOrmConfig, InternalIdResolver],
  exports: [DatabaseConfig, TypeOrmConfig, InternalIdResolver],
})
export class DatabaseModule {}
