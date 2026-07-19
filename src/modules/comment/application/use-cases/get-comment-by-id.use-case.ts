import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { CommentQueryRepository } from '../../infrastructure/comment-query.repository';
import { CommentModel } from '../../models/comment.model';

type GetCommentByIdInput = {
  id: string;
  currentUserId?: string | null;
};

@Injectable()
export class GetCommentByIdUseCase implements IUseCase<GetCommentByIdInput, CommentModel | null> {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  execute({ id }: GetCommentByIdInput): Promise<CommentModel | null> {
    return this.commentQueryRepository.getCommentById(id);
  }
}
