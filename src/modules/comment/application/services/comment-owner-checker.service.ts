import { Injectable } from '@nestjs/common';

import { CommentQueryRepository } from '../../infrastructure/comment-query.repository.mongodb';
import { CommentManageStatuses } from '../../types/types';

type CheckCommentOwnerInput = {
  commentId: string;
  userId: string;
};

@Injectable()
export class CommentOwnerCheckerService {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  async check({ commentId, userId }: CheckCommentOwnerInput): Promise<CommentManageStatuses> {
    const foundComment = await this.commentQueryRepository.getCommentById(commentId);
    if (!foundComment) return CommentManageStatuses.NOT_FOUND;
    if (foundComment.commentatorInfo.userId !== userId) return CommentManageStatuses.NOT_OWNER;
    return CommentManageStatuses.SUCCESS;
  }
}
