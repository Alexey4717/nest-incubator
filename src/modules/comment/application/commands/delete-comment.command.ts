import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteCommentUseCase } from '../use-cases/delete-comment.use-case';

export class DeleteCommentCommand extends TypedCommand<Notification<null>> {
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
  Notification<null>
> {
  constructor(private readonly deleteCommentUseCase: DeleteCommentUseCase) {}

  execute(command: DeleteCommentCommand): Promise<Notification<null>> {
    return this.deleteCommentUseCase.execute({
      commentId: command.commentId,
      userId: command.userId,
    });
  }
}
