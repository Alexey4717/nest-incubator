import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationEmailResendingUseCase } from '../use-cases/registration-email-resending.use-case';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly registrationEmailResendingUseCase: RegistrationEmailResendingUseCase,
  ) {}

  execute(command: RegistrationEmailResendingCommand): Promise<void> {
    return this.registrationEmailResendingUseCase.execute(command.email);
  }
}
