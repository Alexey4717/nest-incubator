import { SortDirections } from '../types/common';
import { applyPagination, applySort } from './typeorm-pagination';

describe('typeorm-pagination', () => {
  const qb = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applySort uses ASC/DESC based on SortDirections', () => {
    applySort(qb as never, 'blog', 'name', SortDirections.asc);
    expect(qb.orderBy).toHaveBeenCalledWith('blog.name', 'ASC');

    applySort(qb as never, 'blog', 'createdAt', SortDirections.desc);
    expect(qb.orderBy).toHaveBeenCalledWith('blog.createdAt', 'DESC');
  });

  it('applyPagination applies skip and take', () => {
    applyPagination(qb as never, 20, 10);
    expect(qb.skip).toHaveBeenCalledWith(20);
    expect(qb.take).toHaveBeenCalledWith(10);
  });
});
