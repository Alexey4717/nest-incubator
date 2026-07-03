import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createE2eApplication } from './utils/e2e-application';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApplication();
  }, 60000);

  afterAll(async () => {
    await app?.close?.();
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect('Hello Nest22!');
  });
});
