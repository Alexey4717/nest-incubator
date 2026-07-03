import { Injectable } from '@nestjs/common';
import { IsEnum, IsNumber } from 'class-validator';

import { applyValidatedConfig } from './config-validation.utility';

export enum Environments {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Testing = 'testing',
}

class CoreEnvironmentVariables {
  @IsNumber({}, { message: 'Set PORT env variable as number' })
  PORT: number;

  @IsEnum(Environments, { message: 'Set correct NODE_ENV env variable' })
  env: Environments;
}

@Injectable()
export class CoreConfig {
  PORT: number;
  env: Environments;

  constructor() {
    applyValidatedConfig(
      this,
      {
        PORT: process.env.PORT || 4000,
        env: process.env.NODE_ENV || Environments.Development,
      },
      CoreEnvironmentVariables,
    );
  }

  get isDevelopment(): boolean {
    return this.env === Environments.Development;
  }

  get isProduction(): boolean {
    return this.env === Environments.Production;
  }

  get isTesting(): boolean {
    return this.env === Environments.Testing;
  }
}
