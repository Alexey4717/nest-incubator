import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { CreateUserDTO } from '../../dto/create-user.dto';
import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';

export class CreateUserCommand extends TypedCommand<GetUserOutputModelFromMongoDB> {
  constructor(public readonly input: CreateUserDTO) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  GetUserOutputModelFromMongoDB
> {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  execute(command: CreateUserCommand): Promise<GetUserOutputModelFromMongoDB> {
    return this.createUserUseCase.execute(command.input);
  }
}
