import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentManageStatuses } from '../../types/types';
import { CommentOwnerCheckerService } from '../services/comment-owner-checker.service';

type UpdateCommentInput = {
  id: string;
  userId: string;
  input: UpdateCommentDTO;
};

@Injectable()
export class UpdateCommentUseCase implements IUseCase<UpdateCommentInput, CommentManageStatuses> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentOwnerCheckerService: CommentOwnerCheckerService,
  ) {}

  async execute({ id, userId, input }: UpdateCommentInput): Promise<CommentManageStatuses> {
    await validateOrRejectModel(input, UpdateCommentDTO, 'UpdateCommentUseCase.execute');

    const checkingResult = await this.commentOwnerCheckerService.check({ commentId: id, userId });
    if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;

    const updateResult = await this.commentRepository.updateCommentById({
      id,
      content: input.content,
    });
    if (!updateResult) return CommentManageStatuses.NOT_FOUND;

    return CommentManageStatuses.SUCCESS;
  }
}
