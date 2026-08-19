import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { CommentRepository } from '../../infrastructure/comment.repository';

type DeleteCommentInput = {
  commentId: string;
  userId: string;
};

@Injectable()
export class DeleteCommentUseCase implements IUseCase<DeleteCommentInput, Notification<null>> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({ commentId, userId }: DeleteCommentInput): Promise<Notification<null>> {
    const comment = await this.commentRepository.findById(commentId);
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

    const deleteResult = await this.commentRepository.deleteCommentById(commentId);
    if (!deleteResult) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
