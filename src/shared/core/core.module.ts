import { Module } from '@nestjs/common';

import { TrimValidator } from '../validators/trim.validator';
import { CoreConfig } from './core.config';

@Module({
  providers: [CoreConfig, TrimValidator],
  exports: [CoreConfig, TrimValidator],
})
export class CoreModule {}
