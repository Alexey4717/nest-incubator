import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { Result } from '@/shared/core/result/result.factory';
import { ResultStatus, Result as ResultType } from '@/shared/core/result/result.types';
import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentOwnerCheckerService } from '../services/comment-owner-checker.service';

type UpdateCommentInput = {
  id: string;
  userId: string;
  input: UpdateCommentDTO;
};

@Injectable()
export class UpdateCommentUseCase implements IUseCase<UpdateCommentInput, ResultType<null>> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentOwnerCheckerService: CommentOwnerCheckerService,
  ) {}

  async execute({ id, userId, input }: UpdateCommentInput): Promise<ResultType<null>> {
    await validateOrRejectModel(input, UpdateCommentDTO, 'UpdateCommentUseCase.execute');

    const checkingResult = await this.commentOwnerCheckerService.check({ commentId: id, userId });
    if (checkingResult.status === ResultStatus.Failure) {
      return checkingResult;
    }

    const updateResult = await this.commentRepository.updateCommentById({
      id,
      content: input.content,
    });
    if (!updateResult) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
