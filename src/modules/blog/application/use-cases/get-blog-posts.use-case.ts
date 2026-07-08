import { Injectable } from '@nestjs/common';

import { Paginator, SortDirections } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';
import { normalizePaginationQuery } from '@/shared/utils/pagination';

import { GetPostsInputModel, SortPostsBy } from '@/modules/post/models/GetPostsInputModel';
import { PostViewMapper } from '@/modules/post/post.view-mapper';
import { PostViewModel } from '@/modules/post/types/view-models';

import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';

type GetBlogPostsInput = {
  blogId: string;
  query: GetPostsInputModel;
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
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const pagination = normalizePaginationQuery<SortPostsBy>(
      { sortBy, sortDirection, pageNumber, pageSize },
      {
        sortBy: 'createdAt' as SortPostsBy,
        sortDirection: SortDirections.desc,
        pageNumber: 1,
        pageSize: 10,
      },
    );

    const resData = await this.blogQueryRepository.getPostsInBlog({
      blogId,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });

    if (!resData) return null;

    const { pagesCount, page, pageSize: responsePageSize, totalCount, items } = resData;

    return {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items: items.map((item) => this.postViewMapper.toPostViewModel(item, currentUserId)),
    };
  }
}
