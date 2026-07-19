import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';

export class DeleteUserCommand extends TypedCommand<ResultType<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, ResultType<null>> {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  execute(command: DeleteUserCommand): Promise<ResultType<null>> {
    return this.deleteUserUseCase.execute(command.id);
  }
}
