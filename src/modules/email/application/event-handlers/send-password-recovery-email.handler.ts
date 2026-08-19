import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserPasswordRecoveryRequestedEvent } from '@/modules/user/domain/events/user-password-recovery-requested.event';

import { EmailService } from '../../email.service';

@EventsHandler(UserPasswordRecoveryRequestedEvent)
export class SendPasswordRecoveryEmailHandler implements IEventHandler<UserPasswordRecoveryRequestedEvent> {
  constructor(private readonly emailService: EmailService) {}

  handle(event: UserPasswordRecoveryRequestedEvent) {
    return this.emailService.sendPasswordRecoveryCode(event.email, event.login, event.code);
  }
}
