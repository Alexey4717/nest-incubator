import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { ChangePasswordUseCase } from '../use-cases/change-password.use-case';

type ChangePasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

export class ChangePasswordCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly input: ChangePasswordInput) {
    super();
  }
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<
  ChangePasswordCommand,
  Notification<null>
> {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  execute(command: ChangePasswordCommand): Promise<Notification<null>> {
    return this.changePasswordUseCase.execute(command.input);
  }
}
