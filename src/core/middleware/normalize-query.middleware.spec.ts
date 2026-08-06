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

  it('preserves sort query array after trim and empty filtering', () => {
    const req = createRequest({
      sort: [' avgScores desc ', '', 'sumScore desc', 'null', '  '],
      pageNumber: ['1', '2'],
    });

    normalizeQueryMiddleware(req, {} as never, () => undefined);

    expect(req.query).toEqual({
      sort: ['avgScores desc', 'sumScore desc'],
      pageNumber: '1',
    });
  });

  it('keeps a single sort value as a trimmed string', () => {
    const req = createRequest({
      sort: ' winsCount desc ',
    });

    normalizeQueryMiddleware(req, {} as never, () => undefined);

    expect(req.query).toEqual({
      sort: 'winsCount desc',
    });
  });
});
