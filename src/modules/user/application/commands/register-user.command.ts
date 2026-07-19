import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UserModel } from '../../models/user.model';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';

type RegisterUserCommandInput = {
  login: string;
  email: string;
  password: string;
};

export class RegisterUserCommand extends TypedCommand<ResultType<UserModel>> {
  constructor(public readonly input: RegisterUserCommandInput) {
    super();
  }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<
  RegisterUserCommand,
  ResultType<UserModel>
> {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  execute(command: RegisterUserCommand): Promise<ResultType<UserModel>> {
    return this.registerUserUseCase.execute(command.input);
  }
}
