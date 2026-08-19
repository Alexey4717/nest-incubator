import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { LikeStatus } from '@/modules/like/types/like-status';

import { UpdatePostLikeStatusUseCase } from '../use-cases/update-post-like-status.use-case';

export class UpdatePostLikeStatusCommand extends TypedCommand<Notification<null>> {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly likeStatus: LikeStatus,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusHandler implements ICommandHandler<
  UpdatePostLikeStatusCommand,
  Notification<null>
> {
  constructor(private readonly updatePostLikeStatusUseCase: UpdatePostLikeStatusUseCase) {}

  execute(command: UpdatePostLikeStatusCommand): Promise<Notification<null>> {
    return this.updatePostLikeStatusUseCase.execute({
      postId: command.postId,
      userId: command.userId,
      likeStatus: command.likeStatus,
    });
  }
}
