import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationConfirmationUseCase } from '../use-cases/registration-confirmation.use-case';

export class RegistrationConfirmationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(private readonly registrationConfirmationUseCase: RegistrationConfirmationUseCase) {}

  execute(command: RegistrationConfirmationCommand): Promise<void> {
    return this.registrationConfirmationUseCase.execute(command.code);
  }
}
