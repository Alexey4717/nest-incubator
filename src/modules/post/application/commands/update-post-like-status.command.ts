import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { LikeStatus } from '@/modules/like/types/like-status';

import { UpdatePostLikeStatusUseCase } from '../use-cases/update-post-like-status.use-case';

export class UpdatePostLikeStatusCommand extends TypedCommand<ResultType<null>> {
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
  ResultType<null>
> {
  constructor(private readonly updatePostLikeStatusUseCase: UpdatePostLikeStatusUseCase) {}

  execute(command: UpdatePostLikeStatusCommand): Promise<ResultType<null>> {
    return this.updatePostLikeStatusUseCase.execute({
      postId: command.postId,
      userId: command.userId,
      likeStatus: command.likeStatus,
    });
  }
}
