import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { Result } from '@/shared/core/result/result.factory';
import { Result as ResultType } from '@/shared/core/result/result.types';
import { IUseCase } from '@/shared/types/use-case';

import { CommentRepository } from '../../infrastructure/comment.repository';

type DeleteCommentInput = {
  commentId: string;
  userId: string;
};

@Injectable()
export class DeleteCommentUseCase implements IUseCase<DeleteCommentInput, ResultType<null>> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({ commentId, userId }: DeleteCommentInput): Promise<ResultType<null>> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    try {
      comment.canBeModifiedBy(userId);
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    const deleteResult = await this.commentRepository.deleteCommentById(commentId);
    if (!deleteResult) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
