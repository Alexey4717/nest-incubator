import { constants } from 'http2';
import request from 'supertest';

import { createSaUser, createSupertestAgent, loginWithAgent } from './utils/auth.helper';
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

  describe('POST /auth/refresh-token', () => {
    beforeAll(async () => {
      await clearAllData(ctx.app);
      await createSaUser(ctx.app, { login, password, email });
    });

    it('login → refresh-token with cookie → 200 + new accessToken', async () => {
      const agent = createSupertestAgent(ctx.app);

      const loginRes = await loginWithAgent(agent, login, password);

      expect(loginRes.accessToken).toEqual(expect.any(String));
      expect(loginRes.setCookie).toBeDefined();

      const refreshRes = await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_OK);

      expect(refreshRes.body.accessToken).toEqual(expect.any(String));
      expect(refreshRes.body.accessToken).not.toBe(loginRes.accessToken);
    });

    it('refresh with old refresh after rotation → 401', async () => {
      const agent = createSupertestAgent(ctx.app);

      const loginRes = await loginWithAgent(agent, login, password);
      const oldRefreshCookie = loginRes.setCookie!;

      await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_OK);

      await request(ctx.app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', oldRefreshCookie as string[])
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });

  describe('POST /auth/logout', () => {
    beforeAll(async () => {
      await clearAllData(ctx.app);
      await createSaUser(ctx.app, { login, password, email });
    });

    it('logout → refresh → 401', async () => {
      const agent = createSupertestAgent(ctx.app);

      await loginWithAgent(agent, login, password);

      await agent.post('/auth/logout').expect(constants.HTTP_STATUS_NO_CONTENT);

      await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('logout clears cookie', async () => {
      const agent = createSupertestAgent(ctx.app);

      await loginWithAgent(agent, login, password);

      const logoutRes = await agent.post('/auth/logout').expect(constants.HTTP_STATUS_NO_CONTENT);

      const setCookie = logoutRes.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
      expect(cookieHeader).toMatch(/refreshToken=;/);
    });
  });
});
