import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { LikeStatus } from '@/modules/like/types/like-status';

import { UpdateCommentLikeStatusUseCase } from '../use-cases/update-comment-like-status.use-case';

export class UpdateCommentLikeStatusCommand extends TypedCommand<boolean> {
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
  boolean
> {
  constructor(private readonly updateCommentLikeStatusUseCase: UpdateCommentLikeStatusUseCase) {}

  execute(command: UpdateCommentLikeStatusCommand): Promise<boolean> {
    return this.updateCommentLikeStatusUseCase.execute({
      commentId: command.commentId,
      userId: command.userId,
      likeStatus: command.likeStatus,
    });
  }
}
