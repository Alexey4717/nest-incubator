import { constants } from 'http2';
import request from 'supertest';

import { E2eContext, initSettings } from './setup/init-settings';

describe('App (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await initSettings();
  }, 60000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  it('/ (GET)', async () => {
    await request(ctx.httpServer).get('/').expect(constants.HTTP_STATUS_OK).expect('Hello Nest22!');
  });
});
