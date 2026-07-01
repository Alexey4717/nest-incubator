import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { CommentViewModel } from '../../types/view-models';
import { GetCommentByIdUseCase } from '../use-cases/get-comment-by-id.use-case';

export class GetCommentByIdQuery extends TypedQuery<CommentViewModel | null> {
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
  CommentViewModel | null
> {
  constructor(private readonly getCommentByIdUseCase: GetCommentByIdUseCase) {}

  execute(query: GetCommentByIdQuery): Promise<CommentViewModel | null> {
    return this.getCommentByIdUseCase.execute({
      id: query.id,
      currentUserId: query.currentUserId,
    });
  }
}
