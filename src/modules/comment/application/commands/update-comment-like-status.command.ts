import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { LikeStatus } from '@/modules/like/types/like-status';

import { UpdateCommentLikeStatusUseCase } from '../use-cases/update-comment-like-status.use-case';

export class UpdateCommentLikeStatusCommand extends TypedCommand<Notification<null>> {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly likeStatus: LikeStatus,
  ) {
    super();
  }
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusHandler implements ICommandHandler<
  UpdateCommentLikeStatusCommand,
  Notification<null>
> {
  constructor(private readonly updateCommentLikeStatusUseCase: UpdateCommentLikeStatusUseCase) {}

  execute(command: UpdateCommentLikeStatusCommand): Promise<Notification<null>> {
    return this.updateCommentLikeStatusUseCase.execute({
      commentId: command.commentId,
      userId: command.userId,
      likeStatus: command.likeStatus,
    });
  }
}
