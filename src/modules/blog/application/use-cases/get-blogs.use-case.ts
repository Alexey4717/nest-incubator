import { Injectable } from '@nestjs/common';

import { Paginator, SortDirections } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';
import { normalizePaginationQuery } from '@/shared/utils/pagination';

import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { BlogModel } from '../../models/blog.model';
import { GetBlogsInputModel, SortBlogsBy } from '../../models/GetBlogsInputModel';

@Injectable()
export class GetBlogsUseCase implements IUseCase<GetBlogsInputModel, Paginator<BlogModel[]>> {
  constructor(private readonly blogQueryRepository: BlogQueryRepository) {}

  async execute(input: GetBlogsInputModel): Promise<Paginator<BlogModel[]>> {
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
      items,
    };
  }
}
