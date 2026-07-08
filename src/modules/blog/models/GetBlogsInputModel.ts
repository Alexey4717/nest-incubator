import { SortDirections } from '@/shared/types/common';

import { BlogModel } from './blog.model';

export type SortBlogsBy = keyof Omit<BlogModel, 'id'>;

export type GetBlogsInputModel = {
  searchNameTerm?: string | null;
  sortBy?: SortBlogsBy;
  sortDirection?: SortDirections;
  pageNumber?: number;
  pageSize?: number;
};
