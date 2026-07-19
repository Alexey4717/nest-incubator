import { constants } from 'http2';
import request from 'supertest';

import { createSaUser } from './utils/auth.helper';
import { clearAllData } from './utils/db.helper';
import { createE2eApplication, E2eContext } from './utils/e2e-application';

describe('Auth refresh token flow (e2e)', () => {
  let ctx: E2eContext;

  const login = 'refuser01';
  const password = 'qwerty12';
  const email = 'refuser01@test.dev';

  beforeAll(async () => {
    ctx = await createE2eApplication();
  }, 120000);

  afterAll(async () => {
    if (ctx?.app) {
      await ctx.app.close();
    }
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);
    await createSaUser(ctx.app, { login, password, email });
  });

  it('login → refresh-token with cookie → 200 + new accessToken', async () => {
    const agent = request.agent(ctx.app.getHttpServer());

    const loginRes = await agent
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(constants.HTTP_STATUS_OK);

    expect(loginRes.body.accessToken).toEqual(expect.any(String));
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const refreshRes = await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_OK);

    expect(refreshRes.body.accessToken).toEqual(expect.any(String));
    expect(refreshRes.body.accessToken).not.toBe(loginRes.body.accessToken);
  });

  it('refresh with old refresh after rotation → 401', async () => {
    const agent = request.agent(ctx.app.getHttpServer());

    const loginRes = await agent
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(constants.HTTP_STATUS_OK);

    const oldRefreshCookie = loginRes.headers['set-cookie'];

    await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_OK);

    await request(ctx.app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', oldRefreshCookie)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });

  it('logout → refresh → 401', async () => {
    const agent = request.agent(ctx.app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(constants.HTTP_STATUS_OK);

    await agent.post('/auth/logout').expect(constants.HTTP_STATUS_NO_CONTENT);

    await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });

  it('logout clears cookie', async () => {
    const agent = request.agent(ctx.app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(constants.HTTP_STATUS_OK);

    const logoutRes = await agent.post('/auth/logout').expect(constants.HTTP_STATUS_NO_CONTENT);

    const setCookie = logoutRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    expect(cookieHeader).toMatch(/refreshToken=;/);
  });
});
