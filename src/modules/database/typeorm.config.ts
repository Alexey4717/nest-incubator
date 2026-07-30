import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

import { CoreConfig } from '@/core/core.config';

import { DatabaseConfig } from './database.config';
import { buildPostgresConnectionOptions } from './postgres-options.utility';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(
    private readonly databaseConfig: DatabaseConfig,
    private readonly coreConfig: CoreConfig,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const poolMax = process.env.NODE_ENV === 'production' ? 1 : 10;

    return {
      ...buildPostgresConnectionOptions({
        host: this.databaseConfig.POSTGRES_HOST,
        port: this.databaseConfig.POSTGRES_PORT,
        username: this.databaseConfig.POSTGRES_USER,
        password: this.databaseConfig.POSTGRES_PASSWORD,
        database: this.databaseConfig.DB_NAME,
        ssl: this.databaseConfig.POSTGRES_SSL,
        poolMax,
      }),
      autoLoadEntities: true,
      logging: this.coreConfig.isDevelopment,
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      synchronize: false,
      migrationsRun: false,
    };
  }
}
