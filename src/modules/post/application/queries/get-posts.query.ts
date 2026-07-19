import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/core/types/common';
import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { GetPostsQueryParamsDto } from '../../dto/get-posts-query-params.dto';
import { PostViewModel } from '../../types/view-models';
import { GetPostsUseCase } from '../use-cases/get-posts.use-case';

export class GetPostsQuery extends TypedQuery<Paginator<PostViewModel[]>> {
  constructor(
    public readonly query: GetPostsQueryParamsDto,
    public readonly currentUserId?: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery, Paginator<PostViewModel[]>> {
  constructor(private readonly getPostsUseCase: GetPostsUseCase) {}

  execute(query: GetPostsQuery): Promise<Paginator<PostViewModel[]>> {
    return this.getPostsUseCase.execute({
      query: query.query,
      currentUserId: query.currentUserId,
    });
  }
}
