import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { CommentRepository } from '../../infrastructure/comment.repository';

type UpdateCommentInput = {
  id: string;
  userId: string;
  input: UpdateCommentDTO;
};

@Injectable()
export class UpdateCommentUseCase implements IUseCase<UpdateCommentInput, Notification<null>> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({ id, userId, input }: UpdateCommentInput): Promise<Notification<null>> {
    await validateOrRejectModel(input, UpdateCommentDTO, 'UpdateCommentUseCase.execute');

    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    try {
      comment.canBeModifiedBy(userId);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }

    comment.update(input.content);
    const updateResult = await this.commentRepository.save(comment);
    if (!updateResult) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
