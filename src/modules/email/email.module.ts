import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DOMAIN_EVENT_HANDLERS } from '@/core/events/domain-event-publisher';

import { SendConfirmationCodeEmailHandler } from './application/event-handlers/send-confirmation-code-email.handler';
import { SendPasswordRecoveryEmailHandler } from './application/event-handlers/send-password-recovery-email.handler';
import { SendRegistrationEmailHandler } from './application/event-handlers/send-registration-email.handler';
import { EmailConfig } from './email.config';
import { EmailService } from './email.service';
import { MailerConfig } from './mailer.config';

const emailEventHandlers = [
  SendRegistrationEmailHandler,
  SendConfirmationCodeEmailHandler,
  SendPasswordRecoveryEmailHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    EmailConfig,
    MailerConfig,
    EmailService,
    ...emailEventHandlers,
    { provide: DOMAIN_EVENT_HANDLERS, useValue: emailEventHandlers },
  ],
  exports: [EmailConfig, MailerConfig, EmailService, ...emailEventHandlers, DOMAIN_EVENT_HANDLERS],
})
export class EmailModule {}
