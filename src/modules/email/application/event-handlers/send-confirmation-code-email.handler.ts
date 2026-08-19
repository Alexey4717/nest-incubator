import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserConfirmationCodeUpdatedEvent } from '@/modules/user/domain/events/user-confirmation-code-updated.event';

import { EmailService } from '../../email.service';

@EventsHandler(UserConfirmationCodeUpdatedEvent)
export class SendConfirmationCodeEmailHandler implements IEventHandler<UserConfirmationCodeUpdatedEvent> {
  constructor(private readonly emailService: EmailService) {}

  handle(event: UserConfirmationCodeUpdatedEvent) {
    return this.emailService.sendEmailWithNewConfirmationCode(event.email, event.login, event.code);
  }
}
