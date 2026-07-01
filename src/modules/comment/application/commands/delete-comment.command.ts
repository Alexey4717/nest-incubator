import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { CommentManageStatuses } from '../../types/types';
import { DeleteCommentUseCase } from '../use-cases/delete-comment.use-case';

export class DeleteCommentCommand extends TypedCommand<CommentManageStatuses> {
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
  CommentManageStatuses
> {
  constructor(private readonly deleteCommentUseCase: DeleteCommentUseCase) {}

  execute(command: DeleteCommentCommand): Promise<CommentManageStatuses> {
    return this.deleteCommentUseCase.execute({
      commentId: command.commentId,
      userId: command.userId,
    });
  }
}
