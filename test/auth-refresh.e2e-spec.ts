import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from './utils/basic-auth.helper';
import { createE2eApplication } from './utils/e2e-application';

describe('Auth refresh token flow (e2e)', () => {
  let app: INestApplication;

  const login = 'refuser01';
  const password = 'qwerty12';
  const email = 'refuser01@test.dev';

  beforeAll(async () => {
    app = await createE2eApplication();
  }, 120000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
    await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ login, password, email })
      .expect(201);
  });

  it('login → refresh-token with cookie → 200 + new accessToken', async () => {
    const agent = request.agent(app.getHttpServer());

    const loginRes = await agent
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(200);

    expect(loginRes.body.accessToken).toEqual(expect.any(String));
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const refreshRes = await agent.post('/auth/refresh-token').expect(200);

    expect(refreshRes.body.accessToken).toEqual(expect.any(String));
    expect(refreshRes.body.accessToken).not.toBe(loginRes.body.accessToken);
  });

  it('refresh with old refresh after rotation → 401', async () => {
    const agent = request.agent(app.getHttpServer());

    const loginRes = await agent
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(200);

    const oldRefreshCookie = loginRes.headers['set-cookie'];

    await agent.post('/auth/refresh-token').expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', oldRefreshCookie)
      .expect(401);
  });

  it('logout → refresh → 401', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.post('/auth/login').send({ loginOrEmail: login, password }).expect(200);

    await agent.post('/auth/logout').expect(204);

    await agent.post('/auth/refresh-token').expect(401);
  });

  it('logout clears cookie', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.post('/auth/login').send({ loginOrEmail: login, password }).expect(200);

    const logoutRes = await agent.post('/auth/logout').expect(204);

    const setCookie = logoutRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    expect(cookieHeader).toMatch(/refreshToken=;/);
  });
});
