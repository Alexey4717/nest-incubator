import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { AuthTokensViewModel } from '../../types/view-models';
import { LoginUseCase } from '../use-cases/login.use-case';

type LoginInput = {
  userId: string;
  ip: string;
  userAgent: string;
};

export class LoginCommand extends TypedCommand<AuthTokensViewModel> {
  constructor(public readonly input: LoginInput) {
    super();
  }
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthTokensViewModel> {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  execute(command: LoginCommand): Promise<AuthTokensViewModel> {
    return this.loginUseCase.execute(command.input);
  }
}
