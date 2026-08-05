import { Request } from 'express';

import { normalizeQueryMiddleware } from './normalize-query.middleware';

function createRequest(query: Record<string, unknown>): Request {
  return { query } as Request;
}

describe('normalizeQueryMiddleware', () => {
  it('removes empty, null-like and whitespace-only query values', () => {
    const req = createRequest({
      pageNumber: '',
      pageSize: '   ',
      sortBy: 'null',
      sortDirection: 'undefined',
      publishedStatus: ' all ',
      bodySearchTerm: 'capital',
    });

    normalizeQueryMiddleware(req, {} as never, () => undefined);

    expect(req.query).toEqual({
      publishedStatus: 'all',
      bodySearchTerm: 'capital',
    });
  });

  it('unwraps repeated query params to a single value', () => {
    const req = createRequest({
      pageNumber: ['1', '2'],
      sortBy: ['createdAt'],
      publishedStatus: ['all'],
    });

    normalizeQueryMiddleware(req, {} as never, () => undefined);

    expect(req.query).toEqual({
      pageNumber: '1',
      sortBy: 'createdAt',
      publishedStatus: 'all',
    });
  });
});
