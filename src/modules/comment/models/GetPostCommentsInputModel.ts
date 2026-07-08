import { SortDirections } from '@/shared/types/common';

import { CommentModel } from './comment.model';

export type SortPostCommentsBy = keyof Pick<CommentModel, 'content' | 'createdAt'>;

export type GetPostCommentsInputModel = {
  sortBy?: SortPostCommentsBy;
  sortDirection?: SortDirections;
  pageNumber?: number;
  pageSize?: number;
};
