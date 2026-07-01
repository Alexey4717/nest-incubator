import { Injectable } from '@nestjs/common';

import { Paginator, SortDirections } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';
import { normalizePaginationQuery } from '@/shared/utils/pagination';

import { getMappedBlogViewModel } from '../../helpers';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository.mongodb';
import { GetBlogsInputModel, SortBlogsBy } from '../../models/GetBlogsInputModel';
import { BlogViewModel } from '../../types/view-models';

@Injectable()
export class GetBlogsUseCase implements IUseCase<GetBlogsInputModel, Paginator<BlogViewModel[]>> {
  constructor(private readonly blogQueryRepository: BlogQueryRepository) {}

  async execute(input: GetBlogsInputModel): Promise<Paginator<BlogViewModel[]>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = input;

    const pagination = normalizePaginationQuery<SortBlogsBy>(
      { sortBy, sortDirection, pageNumber, pageSize },
      {
        sortBy: 'createdAt' as SortBlogsBy,
        sortDirection: SortDirections.desc,
        pageNumber: 1,
        pageSize: 10,
      },
    );

    const resData = await this.blogQueryRepository.getBlogs({
      searchNameTerm: searchNameTerm || null,
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
      items: items.map(getMappedBlogViewModel),
    };
  }
}
