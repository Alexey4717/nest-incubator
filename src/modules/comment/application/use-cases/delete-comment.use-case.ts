import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

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
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(null);
  }
}
