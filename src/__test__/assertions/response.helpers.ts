import { Paginator } from '@/core/types/common';

export function expectPaginatorShape<T>(body: Paginator<T[]>): void {
  expect(body.items).toBeDefined();
  expect(Array.isArray(body.items)).toBe(true);
  expect(typeof body.totalCount).toBe('number');
  expect(typeof body.pagesCount).toBe('number');
  expect(typeof body.page).toBe('number');
  expect(typeof body.pageSize).toBe('number');
}

export function expectPaginatorItemsCount<T>(body: Paginator<T[]>, expectedCount: number): void {
  expectPaginatorShape(body);
  expect(body.items).toHaveLength(expectedCount);
  expect(body.totalCount).toBe(expectedCount);
}
