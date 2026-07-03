import { Injectable } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { applyValidatedConfig, getEnumValues } from '@/shared/core/config-validation.utility';

export enum DbType {
  MONGO = 'MONGO',
  SQL = 'SQL',
}

class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty({ message: 'Set MONGO_URI env variable' })
  MONGO_URI: string;

  @IsString()
  @IsNotEmpty({ message: 'Set DB_NAME env variable' })
  DB_NAME: string;

  @IsEnum(DbType, {
    message: `Set correct DB_TYPE env variable, available values: ${getEnumValues(DbType).join(', ')}`,
  })
  DB_TYPE: DbType;
}

@Injectable()
export class DatabaseConfig {
  MONGO_URI: string;
  DB_NAME: string;
  DB_TYPE: DbType;

  constructor() {
    applyValidatedConfig(this, process.env, DatabaseEnvironmentVariables);
  }
}
