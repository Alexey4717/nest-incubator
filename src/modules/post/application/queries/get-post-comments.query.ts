import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/shared/types/common';
import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { CommentViewModel } from '@/modules/comment/types/view-models';

import { GetPostsInputModel } from '../../models/GetPostsInputModel';
import { GetPostCommentsUseCase } from '../use-cases/get-post-comments.use-case';

export class GetPostCommentsQuery extends TypedQuery<Paginator<CommentViewModel[]> | null> {
  constructor(
    public readonly postId: string,
    public readonly query: GetPostsInputModel,
    public readonly currentUserId?: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsHandler implements IQueryHandler<
  GetPostCommentsQuery,
  Paginator<CommentViewModel[]> | null
> {
  constructor(private readonly getPostCommentsUseCase: GetPostCommentsUseCase) {}

  execute(query: GetPostCommentsQuery): Promise<Paginator<CommentViewModel[]> | null> {
    return this.getPostCommentsUseCase.execute({
      postId: query.postId,
      query: query.query,
      currentUserId: query.currentUserId,
    });
  }
}
