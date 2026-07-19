import { Paginator } from '../types/common';

export class PaginatedViewDto {
  static mapToView<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): Paginator<T> {
    return {
      page: data.page,
      pageSize: data.size,
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      items: data.items,
    };
  }
}
