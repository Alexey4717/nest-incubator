import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { CommentRepository } from '../../infrastructure/comment.repository';

type UpdateCommentInput = {
  id: string;
  userId: string;
  input: UpdateCommentDTO;
};

@Injectable()
export class UpdateCommentUseCase implements IUseCase<UpdateCommentInput, ResultType<null>> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({ id, userId, input }: UpdateCommentInput): Promise<ResultType<null>> {
    await validateOrRejectModel(input, UpdateCommentDTO, 'UpdateCommentUseCase.execute');

    const comment = await this.commentRepository.findById(id);
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

    comment.update(input.content);
    const updateResult = await this.commentRepository.save(comment);
    if (!updateResult) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
