import { SortDirections } from '@/shared/types/common';

import { GetBlogOutputModel } from './GetBlogOutputModel';

export type SortBlogsBy = keyof GetBlogOutputModel;

export type GetBlogsInputModel = {
  /**
   * Set term for search blogs by searchNameTerm in query-params. Default value : null.
   */
  searchNameTerm?: string | null;

  /**
   * Set sortBy for sorting blogs by field in query-params. Default value : createdAt.
   */
  sortBy?: SortBlogsBy;

  /**
   * Set sortDirection for sorting blogs by field and direction in query-params. Default value: desc.
   */
  sortDirection?: SortDirections;

  /**
   * PageNumber is number of portions that should be returned. Default value : 1.
   */
  pageNumber?: number;

  /**
   * PageSize is portions size that should be returned. Default value : 10.
   */
  pageSize?: number;
};
