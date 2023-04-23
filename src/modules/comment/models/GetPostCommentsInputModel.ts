import { GetCommentOutputModel } from './GetCommentOutputModel';
import { SortDirections } from '../../../types/common';

export type SortPostCommentsBy = keyof GetCommentOutputModel;

export type GetPostsInputModel = {
  /**
   * Set sortBy for sorting post comments by field in query-params. Default value: createdAt.
   */
  sortBy: SortPostCommentsBy;

  /**
   * Set sortDirection for sorting post comments by direction in query-params. Default value: desc.
   */
  sortDirection: SortDirections;

  /**
   * PageNumber is number of portions that should be returned. Default value : 1.
   */
  pageNumber: number;

  /**
   * PageSize is portions size that should be returned. Default value : 10.
   */
  pageSize: number;

  /**
   * Id of post that contain comments.
   */
  postId: string;
};
