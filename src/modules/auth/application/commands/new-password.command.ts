import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NewPasswordUseCase } from '../use-cases/new-password.use-case';

type NewPasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

export class NewPasswordCommand {
  constructor(public readonly input: NewPasswordInput) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordHandler implements ICommandHandler<NewPasswordCommand> {
  constructor(private readonly newPasswordUseCase: NewPasswordUseCase) {}

  execute(command: NewPasswordCommand): Promise<boolean> {
    return this.newPasswordUseCase.execute(command.input);
  }
}
