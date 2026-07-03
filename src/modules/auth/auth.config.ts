import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

import { applyValidatedConfig } from '@/shared/core/config-validation.utility';

class AuthEnvironmentVariables {
  @IsString()
  @IsNotEmpty({ message: 'Set ACCESS_TOKEN_SECRET env variable' })
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty({ message: 'Set REFRESH_TOKEN_SECRET env variable' })
  REFRESH_TOKEN_SECRET: string;

  @IsNumber({}, { message: 'Set ACCESS_TOKEN_LIFE_TIME env variable as number' })
  @Min(10, { message: 'ACCESS_TOKEN_LIFE_TIME must be at least 10 seconds' })
  ACCESS_TOKEN_LIFE_TIME: number;

  @IsNumber({}, { message: 'Set REFRESH_TOKEN_LIFE_TIME env variable as number' })
  REFRESH_TOKEN_LIFE_TIME: number;

  @IsString()
  @IsNotEmpty({ message: 'Set SA_LOGIN env variable' })
  SA_LOGIN: string;

  @IsString()
  @IsNotEmpty({ message: 'Set SA_PASSWORD env variable' })
  SA_PASSWORD: string;
}

@Injectable()
export class AuthConfig {
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_LIFE_TIME: number;
  REFRESH_TOKEN_LIFE_TIME: number;
  SA_LOGIN: string;
  SA_PASSWORD: string;

  constructor() {
    applyValidatedConfig(this, process.env, AuthEnvironmentVariables);
  }
}
