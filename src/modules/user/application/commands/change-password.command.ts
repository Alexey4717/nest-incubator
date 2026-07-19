import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';

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
  ResultType<null>
> {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  execute(command: ChangePasswordCommand): Promise<ResultType<null>> {
    return this.changePasswordUseCase.execute(command.input);
  }
}
