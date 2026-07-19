import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreateUserDTO } from '../../dto/create-user.dto';
import { UserModel } from '../../models/user.model';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';

export class CreateUserCommand extends TypedCommand<ResultType<UserModel>> {
  constructor(public readonly input: CreateUserDTO) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  ResultType<UserModel>
> {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  execute(command: CreateUserCommand): Promise<ResultType<UserModel>> {
    return this.createUserUseCase.execute(command.input);
  }
}
