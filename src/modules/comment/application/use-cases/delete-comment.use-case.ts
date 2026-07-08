import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentManageStatuses } from '../../types/types';
import { CommentOwnerCheckerService } from '../services/comment-owner-checker.service';

type DeleteCommentInput = {
  commentId: string;
  userId: string;
};

@Injectable()
export class DeleteCommentUseCase implements IUseCase<DeleteCommentInput, CommentManageStatuses> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentOwnerCheckerService: CommentOwnerCheckerService,
  ) {}

  async execute({ commentId, userId }: DeleteCommentInput): Promise<CommentManageStatuses> {
    const checkingResult = await this.commentOwnerCheckerService.check({ commentId, userId });
    if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;

    const deleteResult = await this.commentRepository.deleteCommentById(commentId);
    if (!deleteResult) return CommentManageStatuses.NOT_FOUND;

    return CommentManageStatuses.SUCCESS;
  }
}
