import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { Result } from '@/shared/core/result/result.factory';
import { ResultStatus, Result as ResultType } from '@/shared/core/result/result.types';
import { IUseCase } from '@/shared/types/use-case';

import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentOwnerCheckerService } from '../services/comment-owner-checker.service';

type DeleteCommentInput = {
  commentId: string;
  userId: string;
};

@Injectable()
export class DeleteCommentUseCase implements IUseCase<DeleteCommentInput, ResultType<null>> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentOwnerCheckerService: CommentOwnerCheckerService,
  ) {}

  async execute({ commentId, userId }: DeleteCommentInput): Promise<ResultType<null>> {
    const checkingResult = await this.commentOwnerCheckerService.check({ commentId, userId });
    if (checkingResult.status === ResultStatus.Failure) {
      return checkingResult;
    }

    const deleteResult = await this.commentRepository.deleteCommentById(commentId);
    if (!deleteResult) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
