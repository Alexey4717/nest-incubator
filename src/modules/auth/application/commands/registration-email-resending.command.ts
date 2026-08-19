import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';

import { RegistrationEmailResendingUseCase } from '../use-cases/registration-email-resending.use-case';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<
  RegistrationEmailResendingCommand,
  Notification<null>
> {
  constructor(
    private readonly registrationEmailResendingUseCase: RegistrationEmailResendingUseCase,
  ) {}

  execute(command: RegistrationEmailResendingCommand): Promise<Notification<null>> {
    return this.registrationEmailResendingUseCase.execute(command.email);
  }
}
