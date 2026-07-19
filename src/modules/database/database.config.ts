import { Injectable } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { applyValidatedConfig, convertToBoolean } from '@/core/config-validation.utility';

class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty({ message: 'Set DB_NAME env variable' })
  DB_NAME: string;

  @IsString()
  @IsNotEmpty({ message: 'Set POSTGRES_HOST env variable' })
  POSTGRES_HOST: string;

  @IsNumber({}, { message: 'Set POSTGRES_PORT env variable as number' })
  POSTGRES_PORT: number;

  @IsString()
  @IsNotEmpty({ message: 'Set POSTGRES_USER env variable' })
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty({ message: 'Set POSTGRES_PASSWORD env variable' })
  POSTGRES_PASSWORD: string;

  @IsOptional()
  @IsBoolean()
  POSTGRES_SSL: boolean;
}

@Injectable()
export class DatabaseConfig {
  DB_NAME: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_SSL: boolean;

  constructor() {
    applyValidatedConfig(
      this,
      {
        ...process.env,
        POSTGRES_SSL: convertToBoolean(process.env.POSTGRES_SSL),
      },
      DatabaseEnvironmentVariables,
    );
  }
}
