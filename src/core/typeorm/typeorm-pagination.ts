import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { SortDirections } from '../types/common';

export const applySort = <Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  alias: string,
  sortColumn: string,
  sortDirection: SortDirections,
): SelectQueryBuilder<Entity> => {
  return qb.orderBy(
    `${alias}.${sortColumn}`,
    sortDirection === SortDirections.asc ? 'ASC' : 'DESC',
  );
};

export const applyPagination = <Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  skip: number,
  take: number,
): SelectQueryBuilder<Entity> => {
  return qb.skip(skip).take(take);
};
