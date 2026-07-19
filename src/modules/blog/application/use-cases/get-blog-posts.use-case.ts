import { Injectable } from '@nestjs/common';

import { Paginator } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';

import { GetPostsQueryParamsDto } from '@/modules/post/dto/get-posts-query-params.dto';
import { PostViewMapper } from '@/modules/post/post.view-mapper';
import { PostViewModel } from '@/modules/post/types/view-models';

import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';

type GetBlogPostsInput = {
  blogId: string;
  query: GetPostsQueryParamsDto;
  currentUserId?: string | null;
};

@Injectable()
export class GetBlogPostsUseCase implements IUseCase<
  GetBlogPostsInput,
  Paginator<PostViewModel[]> | null
> {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postViewMapper: PostViewMapper,
  ) {}

  async execute({
    blogId,
    query,
    currentUserId,
  }: GetBlogPostsInput): Promise<Paginator<PostViewModel[]> | null> {
    const resData = await this.blogQueryRepository.getPostsInBlog(blogId, query);

    if (!resData) return null;

    return {
      ...resData,
      items: resData.items.map((item) => this.postViewMapper.toPostViewModel(item, currentUserId)),
    };
  }
}
