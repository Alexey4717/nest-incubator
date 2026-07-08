import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { CreateUserDTO } from '../../dto/create-user.dto';
import { UserModel } from '../../models/user.model';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';

export class CreateUserCommand extends TypedCommand<UserModel> {
  constructor(public readonly input: CreateUserDTO) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserModel> {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  execute(command: CreateUserCommand): Promise<UserModel> {
    return this.createUserUseCase.execute(command.input);
  }
}
