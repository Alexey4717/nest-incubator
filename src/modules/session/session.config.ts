import { Injectable } from '@nestjs/common';
import { IsNumber } from 'class-validator';

import { applyValidatedConfig } from '@/shared/core/config-validation.utility';

class SessionEnvironmentVariables {
  @IsNumber({}, { message: 'Set REFRESH_TOKEN_LIFE_TIME env variable as number' })
  REFRESH_TOKEN_LIFE_TIME: number;
}

@Injectable()
export class SessionConfig {
  REFRESH_TOKEN_LIFE_TIME: number;

  constructor() {
    applyValidatedConfig(this, process.env, SessionEnvironmentVariables);
  }
}
