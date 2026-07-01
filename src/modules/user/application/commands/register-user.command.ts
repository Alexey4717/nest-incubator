import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';

type RegisterUserInput = {
  login: string;
  email: string;
  password: string;
};

export class RegisterUserCommand {
  constructor(public readonly input: RegisterUserInput) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  execute(command: RegisterUserCommand): Promise<GetUserOutputModelFromMongoDB> {
    return this.registerUserUseCase.execute(command.input);
  }
}
