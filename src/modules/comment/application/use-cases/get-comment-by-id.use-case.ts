import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { CommentViewMapper } from '../../comment.view-mapper';
import { CommentQueryRepository } from '../../infrastructure/comment-query.repository';
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
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly commentViewMapper: CommentViewMapper,
  ) {}

  async execute({ id, currentUserId }: GetCommentByIdInput): Promise<CommentViewModel | null> {
    const comment = await this.commentQueryRepository.getCommentById(id);
    if (!comment) return null;
    return this.commentViewMapper.toCommentViewModel(comment, currentUserId ?? undefined);
  }
}
