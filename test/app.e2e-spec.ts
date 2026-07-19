import { constants } from 'http2';
import request from 'supertest';

import { createE2eApplication, E2eContext } from './utils/e2e-application';

describe('App (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await createE2eApplication();
  }, 60000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  it('/ (GET)', async () => {
    await request(ctx.app.getHttpServer())
      .get('/')
      .expect(constants.HTTP_STATUS_OK)
      .expect('Hello Nest22!');
  });
});
