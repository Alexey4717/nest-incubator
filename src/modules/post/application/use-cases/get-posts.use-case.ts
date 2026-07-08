import { Injectable } from '@nestjs/common';

import { Paginator, SortDirections } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';
import { normalizePaginationQuery } from '@/shared/utils/pagination';

import { PostQueryRepository } from '../../infrastructure/post-query.repository';
import { GetPostsInputModel, SortPostsBy } from '../../models/GetPostsInputModel';
import { PostViewMapper } from '../../post.view-mapper';
import { PostViewModel } from '../../types/view-models';

type GetPostsInput = GetPostsInputModel & {
  currentUserId?: string | null;
};

@Injectable()
export class GetPostsUseCase implements IUseCase<GetPostsInput, Paginator<PostViewModel[]>> {
  constructor(
    private readonly postQueryRepository: PostQueryRepository,
    private readonly postViewMapper: PostViewMapper,
  ) {}

  async execute(input: GetPostsInput): Promise<Paginator<PostViewModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize, currentUserId } = input;

    const pagination = normalizePaginationQuery<SortPostsBy>(
      { sortBy, sortDirection, pageNumber, pageSize },
      {
        sortBy: 'createdAt' as SortPostsBy,
        sortDirection: SortDirections.desc,
        pageNumber: 1,
        pageSize: 10,
      },
    );

    const resData = await this.postQueryRepository.getPosts({
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });

    const { pagesCount, page, pageSize: responsePageSize, totalCount, items } = resData || {};

    return {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items: items.map((item) => this.postViewMapper.toPostViewModel(item, currentUserId)),
    };
  }
}
