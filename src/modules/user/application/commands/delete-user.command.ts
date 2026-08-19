import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';

export class DeleteUserCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, Notification<null>> {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  execute(command: DeleteUserCommand): Promise<Notification<null>> {
    return this.deleteUserUseCase.execute(command.id);
  }
}
