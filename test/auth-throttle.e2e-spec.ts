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

  it('POST /auth/registration — 5 запросов 204, 6-й 429', async () => {
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
  });
});
