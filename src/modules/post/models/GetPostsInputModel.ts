import { SortDirections } from '@/shared/types/common';

import { GetPostOutputModel } from './GetPostOutputModel';

export type SortPostsBy = keyof GetPostOutputModel;

export type GetPostsInputModel = {
  /**
   * Set sortBy for sorting posts by field in query-params. Default value : createdAt.
   */
  sortBy?: SortPostsBy;

  /**
   * Set sortDirection for sorting posts by field and direction in query-params. Default value: desc.
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
