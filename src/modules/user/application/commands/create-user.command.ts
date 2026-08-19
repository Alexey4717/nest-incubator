import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreateUserDTO } from '../../dto/create-user.dto';
import { UserModel } from '../../models/user.model';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';

export class CreateUserCommand extends TypedCommand<Notification<UserModel>> {
  constructor(public readonly input: CreateUserDTO) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  Notification<UserModel>
> {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  execute(command: CreateUserCommand): Promise<Notification<UserModel>> {
    return this.createUserUseCase.execute(command.input);
  }
}
