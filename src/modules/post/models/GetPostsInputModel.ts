import { SortDirections } from '@/shared/types/common';

import { PostModel } from './post.model';

export type SortPostsBy = keyof Pick<PostModel, 'title' | 'blogName' | 'createdAt'>;

export type GetPostsInputModel = {
  sortBy?: SortPostsBy;
  sortDirection?: SortDirections;
  pageNumber?: number;
  pageSize?: number;
};
