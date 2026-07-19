import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/shared/core/result/result.types';
import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { DeleteCommentUseCase } from '../use-cases/delete-comment.use-case';

export class DeleteCommentCommand extends TypedCommand<ResultType<null>> {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<
  DeleteCommentCommand,
  ResultType<null>
> {
  constructor(private readonly deleteCommentUseCase: DeleteCommentUseCase) {}

  execute(command: DeleteCommentCommand): Promise<ResultType<null>> {
    return this.deleteCommentUseCase.execute({
      commentId: command.commentId,
      userId: command.userId,
    });
  }
}
