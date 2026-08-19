import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { LikeStatus } from '@/modules/like/types/like-status';

import { PostRepository } from '../../infrastructure/post.repository';

type UpdatePostLikeStatusInput = {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
};

@Injectable()
export class UpdatePostLikeStatusUseCase implements IUseCase<
  UpdatePostLikeStatusInput,
  Notification<null>
> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({
    postId,
    userId,
    likeStatus,
  }: UpdatePostLikeStatusInput): Promise<Notification<null>> {
    const updated = await this.postRepository.updatePostLikeStatus({
      postId,
      userId,
      likeStatus,
    });
    if (!updated) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    return Notification.ok(null);
  }
}
