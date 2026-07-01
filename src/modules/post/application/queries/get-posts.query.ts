import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/shared/types/common';
import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { GetPostsInputModel } from '../../models/GetPostsInputModel';
import { PostViewModel } from '../../types/view-models';
import { GetPostsUseCase } from '../use-cases/get-posts.use-case';

export class GetPostsQuery extends TypedQuery<Paginator<PostViewModel[]>> {
  constructor(public readonly input: GetPostsInputModel & { currentUserId?: string | null }) {
    super();
  }
}

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery, Paginator<PostViewModel[]>> {
  constructor(private readonly getPostsUseCase: GetPostsUseCase) {}

  execute(query: GetPostsQuery): Promise<Paginator<PostViewModel[]>> {
    return this.getPostsUseCase.execute(query.input);
  }
}
