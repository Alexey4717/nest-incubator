import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createE2eApplication } from './utils/e2e-application';
import { ADMIN_BASIC_AUTH_HEADER } from './utils/basic-auth.helper';

/** E2e требуют доступный MongoDB (локально задаётся MONGO_URI). */
const homeworkSuite = process.env.MONGO_URI ? describe : describe.skip;

homeworkSuite('Homework14 — users & auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApplication();
  }, 120000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('sparse recovery index + два POST /users + GET список', () => {
    it('DELETE /testing/all-data — 204', async () => {
      await request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(204);
    });

    it('POST /users первый — 201', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({
          login: 'e2euser1',
          password: 'qwerty12',
          email: 'e2euser1@test.dev',
        })
        .expect(201);
    });

    it('POST /users второй — 201 (нет E11000)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({
          login: 'e2euser2',
          password: 'qwerty12',
          email: 'e2euser2@test.dev',
        })
        .expect(201);
    });

    it('GET /users — пагинация', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .expect(200);
      expect(res.body.items).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.totalCount).toBe('number');
    });
  });

  describe('POST /auth/login после POST /users', () => {
    const login = 'e2elog01';
    const password = 'qwerty12';
    const email = 'e2elog01@test.dev';

    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(204);
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({
          login,
          password,
          email,
        })
        .expect(201);
    });

    it('логин возвращает accessToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: login,
          password,
        })
        .expect(200);

      expect(res.body.accessToken).toEqual(expect.any(String));
    });
  });

  describe('Basic Auth', () => {
    it('POST /users без Authorization — 401', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'n',
          password: 'qwerty12',
          email: 'n@test.dev',
        })
        .expect(401);
    });
  });
});
