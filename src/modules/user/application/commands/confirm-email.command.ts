import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConfirmEmailUseCase } from '../use-cases/confirm-email.use-case';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand> {
  constructor(private readonly confirmEmailUseCase: ConfirmEmailUseCase) {}

  execute(command: ConfirmEmailCommand): Promise<void> {
    return this.confirmEmailUseCase.execute(command.code);
  }
}
