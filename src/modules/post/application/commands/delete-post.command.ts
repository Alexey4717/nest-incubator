import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeletePostUseCase } from '../use-cases/delete-post.use-case';

export class DeletePostCommand extends TypedCommand<ResultType<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand, ResultType<null>> {
  constructor(private readonly deletePostUseCase: DeletePostUseCase) {}

  execute(command: DeletePostCommand): Promise<ResultType<null>> {
    return this.deletePostUseCase.execute(command.id);
  }
}
