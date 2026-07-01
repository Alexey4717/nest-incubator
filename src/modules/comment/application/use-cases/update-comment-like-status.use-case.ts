import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { LikeStatus } from '@/modules/like/types/like-status';

import { CommentRepository } from '../../infrastructure/comment.repository.mongodb';

type UpdateCommentLikeStatusInput = {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
};

@Injectable()
export class UpdateCommentLikeStatusUseCase implements IUseCase<
  UpdateCommentLikeStatusInput,
  boolean
> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({ commentId, userId, likeStatus }: UpdateCommentLikeStatusInput): Promise<boolean> {
    return this.commentRepository.updateCommentLikeStatusByCommentId({
      commentId,
      userId,
      likeStatus,
    });
  }
}
