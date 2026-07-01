import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PasswordRecoveryUseCase } from '../use-cases/password-recovery.use-case';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(private readonly passwordRecoveryUseCase: PasswordRecoveryUseCase) {}

  execute(command: PasswordRecoveryCommand) {
    return this.passwordRecoveryUseCase.execute(command.email);
  }
}
