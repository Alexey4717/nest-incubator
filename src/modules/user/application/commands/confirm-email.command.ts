import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { ConfirmEmailUseCase } from '../use-cases/confirm-email.use-case';

export class ConfirmEmailCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly code: string) {
    super();
  }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<
  ConfirmEmailCommand,
  Notification<null>
> {
  constructor(private readonly confirmEmailUseCase: ConfirmEmailUseCase) {}

  execute(command: ConfirmEmailCommand): Promise<Notification<null>> {
    return this.confirmEmailUseCase.execute(command.code);
  }
}
