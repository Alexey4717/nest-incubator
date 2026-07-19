import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { Result } from '@/shared/core/result/result.factory';
import { Result as ResultType } from '@/shared/core/result/result.types';

import { CommentQueryRepository } from '../../infrastructure/comment-query.repository';

type CheckCommentOwnerInput = {
  commentId: string;
  userId: string;
};

@Injectable()
export class CommentOwnerCheckerService {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  async check({ commentId, userId }: CheckCommentOwnerInput): Promise<ResultType<null>> {
    const foundComment = await this.commentQueryRepository.getCommentById(commentId);
    if (!foundComment) {
      return Result.fail(DomainExceptionCode.NotFound);
    }
    if (foundComment.commentatorInfo.userId !== userId) {
      return Result.fail(DomainExceptionCode.Forbidden);
    }
    return Result.ok(null);
  }
}
