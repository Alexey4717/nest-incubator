import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { CoreConfig } from './core.config';
import { AllHttpExceptionsFilter } from './errors/all-http-exceptions.filter';
import { DomainHttpExceptionsFilter } from './errors/domain-http-exceptions.filter';
import { DomainEventPublisher } from './events/domain-event-publisher';
import { BcryptService } from './services/bcrypt.service';
import { TrimValidator } from './validators/trim.validator';

@Global()
@Module({
  providers: [
    CoreConfig,
    TrimValidator,
    BcryptService,
    DomainEventPublisher,
    AllHttpExceptionsFilter,
    DomainHttpExceptionsFilter,
    { provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainHttpExceptionsFilter },
  ],
  exports: [CoreConfig, TrimValidator, BcryptService, DomainEventPublisher],
})
export class CoreModule {}
