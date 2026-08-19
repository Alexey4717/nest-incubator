import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRegisteredEvent } from '@/modules/user/domain/events/user-registered.event';

import { EmailService } from '../../email.service';

@EventsHandler(UserRegisteredEvent)
export class SendRegistrationEmailHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private readonly emailService: EmailService) {}

  handle(event: UserRegisteredEvent) {
    return this.emailService.sendRegistrationEmail(event.email, event.login, event.code);
  }
}
