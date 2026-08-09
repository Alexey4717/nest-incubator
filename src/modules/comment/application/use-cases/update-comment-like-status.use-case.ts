import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
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
  ResultType<null>
> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusInput): Promise<ResultType<null>> {
    const isUpdated = await this.commentRepository.updateCommentLikeStatusByCommentId({
      commentId,
      userId,
      likeStatus,
    });

    if (!isUpdated) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
