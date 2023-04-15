export enum SortDirections {
  desc = 'desc',
  asc = 'asc',
}

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export type CommonQueryParamsTypes = {
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};
