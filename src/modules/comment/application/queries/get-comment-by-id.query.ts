import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { CommentModel } from '../../models/comment.model';
import { GetCommentByIdUseCase } from '../use-cases/get-comment-by-id.use-case';

export class GetCommentByIdQuery extends TypedQuery<CommentModel | null> {
  constructor(
    public readonly id: string,
    public readonly currentUserId?: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdHandler implements IQueryHandler<
  GetCommentByIdQuery,
  CommentModel | null
> {
  constructor(private readonly getCommentByIdUseCase: GetCommentByIdUseCase) {}

  execute(query: GetCommentByIdQuery): Promise<CommentModel | null> {
    return this.getCommentByIdUseCase.execute({
      id: query.id,
      currentUserId: query.currentUserId,
    });
  }
}
