import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';

import { ChangePasswordUseCase } from '../use-cases/change-password.use-case';

type ChangePasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

export class ChangePasswordCommand {
  constructor(public readonly input: ChangePasswordInput) {}
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
