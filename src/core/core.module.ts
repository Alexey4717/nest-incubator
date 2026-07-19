import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { BcryptService } from './application/bcrypt.service';
import { CoreConfig } from './core.config';
import { AllHttpExceptionsFilter } from './filters/all-http-exceptions.filter';
import { DomainHttpExceptionsFilter } from './filters/domain-http-exceptions.filter';
import { TrimValidator } from './validators/trim.validator';

@Global()
@Module({
  providers: [
    CoreConfig,
    TrimValidator,
    BcryptService,
    AllHttpExceptionsFilter,
    DomainHttpExceptionsFilter,
    { provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainHttpExceptionsFilter },
  ],
  exports: [CoreConfig, TrimValidator, BcryptService],
})
export class CoreModule {}
