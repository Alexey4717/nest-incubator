import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { LikeStatus } from '@/modules/like/types/like-status';

import { CommentRepository } from '../../infrastructure/comment.repository';

type UpdateCommentLikeStatusInput = {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
};

@Injectable()
export class UpdateCommentLikeStatusUseCase implements IUseCase<
  UpdateCommentLikeStatusInput,
  Notification<null>
> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusInput): Promise<Notification<null>> {
    const isUpdated = await this.commentRepository.updateCommentLikeStatusByCommentId({
      commentId,
      userId,
      likeStatus,
    });

    if (!isUpdated) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    return Notification.ok(null);
  }
}
