import { Module } from '@nestjs/common';

import { TrimValidator } from '../validators/trim.validator';
import { BcryptService } from './application/bcrypt.service';
import { CoreConfig } from './core.config';

@Module({
  providers: [CoreConfig, TrimValidator, BcryptService],
  exports: [CoreConfig, TrimValidator, BcryptService],
})
export class CoreModule {}
