import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { getMappedCommentViewModel } from '../../helpers';
import { CommentQueryRepository } from '../../infrastructure/comment-query.repository.mongodb';
import { CommentViewModel } from '../../types/view-models';

type GetCommentByIdInput = {
  id: string;
  currentUserId?: string | null;
};

@Injectable()
export class GetCommentByIdUseCase implements IUseCase<
  GetCommentByIdInput,
  CommentViewModel | null
> {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  async execute({ id, currentUserId }: GetCommentByIdInput): Promise<CommentViewModel | null> {
    const comment = await this.commentQueryRepository.getCommentById(id);
    if (!comment) return null;
    return getMappedCommentViewModel({ ...comment, currentUserId: currentUserId ?? undefined });
  }
}
