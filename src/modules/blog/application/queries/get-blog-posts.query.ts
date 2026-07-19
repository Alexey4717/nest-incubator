import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/shared/types/common';
import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { GetPostsQueryParamsDto } from '@/modules/post/dto/get-posts-query-params.dto';
import { PostViewModel } from '@/modules/post/types/view-models';

import { GetBlogPostsUseCase } from '../use-cases/get-blog-posts.use-case';

export class GetBlogPostsQuery extends TypedQuery<Paginator<PostViewModel[]> | null> {
  constructor(
    public readonly blogId: string,
    public readonly query: GetPostsQueryParamsDto,
    public readonly currentUserId: string | null = null,
  ) {
    super();
  }
}

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsHandler implements IQueryHandler<
  GetBlogPostsQuery,
  Paginator<PostViewModel[]> | null
> {
  constructor(private readonly getBlogPostsUseCase: GetBlogPostsUseCase) {}

  execute(query: GetBlogPostsQuery): Promise<Paginator<PostViewModel[]> | null> {
    return this.getBlogPostsUseCase.execute({
      blogId: query.blogId,
      query: query.query,
      currentUserId: query.currentUserId,
    });
  }
}
