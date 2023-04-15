import { GetUserOutputModel } from './GetUserOutputModel';
import { SortDirections } from '../../../types/common';

export type SortUsersBy = keyof GetUserOutputModel;

export type GetUsersInputModel = {
  /**
   * Set sortBy for sorting user by field in query-params. Default value : createdAt.
   */
  sortBy?: SortUsersBy;

  /**
   * Set sortDirection for sorting user by field and direction in query-params. Default value: desc.
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

  /**
   * Search term for user Login: Login should contains this term in any position. Default value: null.
   */
  searchLoginTerm?: string | null;

  /**
   * Search term for user Email: Email should contains this term in any position. Default value: null.
   */
  searchEmailTerm?: string | null;
};
