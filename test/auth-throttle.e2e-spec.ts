import { constants } from 'http2';
import request from 'supertest';

import { clearAllData } from './utils/db.helper';
import { createE2eApplication, E2eContext } from './utils/e2e-application';

describe('Auth throttle (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await createE2eApplication();
  }, 120000);

  afterAll(async () => {
    if (ctx?.app) {
      await ctx.app.close();
    }
  });

  it('POST /auth/registration — 5 запросов 204, 6-й 429, после паузы снова 204', async () => {
    await clearAllData(ctx.app);

    for (let i = 1; i <= 5; i++) {
      await request(ctx.app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: `thr${i}`,
          email: `thr${i}@test.dev`,
          password: 'qwerty12',
        })
        .expect(constants.HTTP_STATUS_NO_CONTENT);
    }

    await request(ctx.app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'thr6',
        email: 'thr6@test.dev',
        password: 'qwerty12',
      })
      .expect(429);

    await new Promise((resolve) => setTimeout(resolve, 10_000));

    await request(ctx.app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'thr7',
        email: 'thr7@test.dev',
        password: 'qwerty12',
      })
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  it('POST /auth/login (несуществующий пользователь) — 5 запросов 401, 6-й 429', async () => {
    await clearAllData(ctx.app);

    for (let i = 1; i <= 5; i++) {
      await request(ctx.app.getHttpServer())
        .post('/auth/login')
        .send({ loginOrEmail: `unknown${i}`, password: 'qwerty12' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    }

    await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: 'unknown6', password: 'qwerty12' })
      .expect(429);
  });

  it('POST /auth/registration-email-resending — 5 запросов 204, 6-й 429, после паузы снова 204', async () => {
    await clearAllData(ctx.app);

    await request(ctx.app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'resend1',
        email: 'resend1@test.dev',
        password: 'qwerty12',
      })
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    for (let i = 1; i <= 5; i++) {
      await request(ctx.app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({ email: 'resend1@test.dev' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);
    }

    await request(ctx.app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: 'resend1@test.dev' })
      .expect(429);

    await new Promise((resolve) => setTimeout(resolve, 10_000));

    await request(ctx.app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: 'resend1@test.dev' })
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  it('POST /auth/registration-confirmation — неверный code: 5 запросов 400, 6-й 429', async () => {
    await clearAllData(ctx.app);

    for (let i = 1; i <= 5; i++) {
      await request(ctx.app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({ code: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}` })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    }

    await request(ctx.app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code: '00000000-0000-0000-0000-000000000006' })
      .expect(429);
  });
});
