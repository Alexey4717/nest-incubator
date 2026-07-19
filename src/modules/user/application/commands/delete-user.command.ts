import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';

export class DeleteUserCommand extends TypedCommand<boolean> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, boolean> {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  execute(command: DeleteUserCommand): Promise<boolean> {
    return this.deleteUserUseCase.execute(command.id);
  }
}
