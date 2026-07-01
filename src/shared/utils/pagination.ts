import { SortDirections } from '../types/common';

export type PaginationQuery = {
  sortBy?: string;
  sortDirection?: SortDirections;
  pageNumber?: number | string;
  pageSize?: number | string;
};

export type PaginationDefaults<TSortBy extends string = string> = {
  sortBy: TSortBy;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};

export type NormalizedPagination<TSortBy extends string = string> = {
  sortBy: TSortBy;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};

export const normalizePaginationQuery = <TSortBy extends string>(
  query: PaginationQuery,
  defaults: PaginationDefaults<TSortBy>,
): NormalizedPagination<TSortBy> => ({
  sortBy: (query.sortBy || defaults.sortBy) as TSortBy,
  sortDirection: query.sortDirection || defaults.sortDirection,
  pageNumber: +(query.pageNumber ?? defaults.pageNumber),
  pageSize: +(query.pageSize ?? defaults.pageSize),
});
