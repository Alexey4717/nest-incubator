import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

import { applyValidatedConfig } from '@/core/config-validation.utility';

class EmailEnvironmentVariables {
  @IsString()
  NODEMAILER_USER_TRANSPORT: string;

  @IsString()
  NODEMAILER_PASSWORD_TRANSPORT: string;

  @IsString()
  @IsNotEmpty({ message: 'Set NODEMAILER_FROM env variable' })
  NODEMAILER_FROM: string;

  @IsString()
  @IsNotEmpty({ message: 'Set MAIN_URL env variable' })
  MAIN_URL: string;
}

@Injectable()
export class EmailConfig {
  NODEMAILER_USER_TRANSPORT: string;
  NODEMAILER_PASSWORD_TRANSPORT: string;
  NODEMAILER_FROM: string;
  MAIN_URL: string;

  constructor() {
    applyValidatedConfig(this, process.env, EmailEnvironmentVariables);
  }
}
