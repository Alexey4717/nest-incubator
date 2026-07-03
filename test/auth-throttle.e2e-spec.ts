import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createE2eApplication } from './utils/e2e-application';

describe('Auth throttle (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApplication();
  }, 120000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/registration — 5 запросов 204, 6-й 429, после паузы снова 204', async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);

    for (let i = 1; i <= 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: `thr${i}`,
          email: `thr${i}@test.dev`,
          password: 'qwerty12',
        })
        .expect(204);
    }

    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'thr6',
        email: 'thr6@test.dev',
        password: 'qwerty12',
      })
      .expect(429);

    await new Promise((resolve) => setTimeout(resolve, 10_000));

    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'thr7',
        email: 'thr7@test.dev',
        password: 'qwerty12',
      })
      .expect(204);
  });

  it('POST /auth/login (несуществующий пользователь) — 5 запросов 401, 6-й 429', async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);

    for (let i = 1; i <= 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginOrEmail: `unknown${i}`, password: 'qwerty12' })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: 'unknown6', password: 'qwerty12' })
      .expect(429);
  });

  it('POST /auth/registration-confirmation — неверный code: 5 запросов 400, 6-й 429', async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);

    for (let i = 1; i <= 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({ code: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}` })
        .expect(400);
    }

    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code: '00000000-0000-0000-0000-000000000006' })
      .expect(429);
  });
});
