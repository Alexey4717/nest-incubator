import { SortDirections } from '@/shared/types/common';

export type SortUsersBy = 'login' | 'email' | 'createdAt';

export type GetUsersInputModel = {
  sortBy?: SortUsersBy;
  sortDirection?: SortDirections;
  pageNumber?: number;
  pageSize?: number;
  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;
};
