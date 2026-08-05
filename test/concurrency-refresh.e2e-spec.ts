import { constants } from 'http2';
import request from 'supertest';

import { countStatuses, runParallelRequests } from './helpers/concurrency.helper';
import { clearAllData } from './helpers/db.helper';
import { E2eContext, initSettings } from './helpers/init-settings';

describe('Refresh token concurrency (e2e)', () => {
  let ctx: E2eContext;

  const login = 'crfrsh01';
  const password = 'qwerty12';
  const email = 'crfrsh01@test.dev';
  const PARALLEL_COUNT = 10;

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    if (ctx?.app) {
      await ctx.app.close();
    }
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);
    await ctx.users.createSaUser({ login, password, email });
  });

  it('parallel refresh with same cookie → exactly one 200, rest 401', async () => {
    const agent = ctx.auth.createSupertestAgent();
    const loginRes = await ctx.auth.loginWithAgent(agent, login, password);
    const refreshCookie = loginRes.setCookie!;

    const results = await runParallelRequests(PARALLEL_COUNT, () =>
      request(ctx.httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', refreshCookie as string[]),
    );

    expect(countStatuses(results, constants.HTTP_STATUS_OK)).toBe(1);
    expect(countStatuses(results, constants.HTTP_STATUS_UNAUTHORIZED)).toBe(PARALLEL_COUNT - 1);
  });
});
