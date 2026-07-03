import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from './utils/basic-auth.helper';
import { createE2eApplication } from './utils/e2e-application';

describe('Security devices (e2e)', () => {
  let app: INestApplication;

  const login = 'secuser';
  const password = 'qwerty12';
  const email = 'secuser@test.dev';

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
      .post('/users')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ login, password, email })
      .expect(201);
  });

  it('2 logins same user (different User-Agent) → GET /security/devices returns 2 devices', async () => {
    const ua1 = 'Mozilla/5.0 E2E-Device-One';
    const ua2 = 'Mozilla/5.0 E2E-Device-Two';

    const login1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', ua1)
      .send({ loginOrEmail: login, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', ua2)
      .send({ loginOrEmail: login, password })
      .expect(200);

    const devicesRes = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Authorization', `Bearer ${login1.body.accessToken}`)
      .expect(200);

    expect(devicesRes.body).toHaveLength(2);
    const titles = devicesRes.body.map((device: { title: string }) => device.title);
    expect(titles).toContain(ua1);
    expect(titles).toContain(ua2);
  });

  it('DELETE /security/devices/:deviceId for other user device → 403', async () => {
    const otherLogin = 'secuser2';
    const otherEmail = 'secuser2@test.dev';

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ login: otherLogin, password, email: otherEmail })
      .expect(201);

    const user1Login = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'User1-Device')
      .send({ loginOrEmail: login, password })
      .expect(200);

    const user2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'User2-Device')
      .send({ loginOrEmail: otherLogin, password })
      .expect(200);

    const user2Devices = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Authorization', `Bearer ${user2Login.body.accessToken}`)
      .expect(200);

    const otherUserDeviceId = user2Devices.body[0].deviceId;

    await request(app.getHttpServer())
      .delete(`/security/devices/${otherUserDeviceId}`)
      .set('Authorization', `Bearer ${user1Login.body.accessToken}`)
      .expect(403);
  });

  it('DELETE non-existent deviceId → 404', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: login, password })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/security/devices/${randomUUID()}`)
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(404);
  });

  it('DELETE /security/devices → current device remains, others deleted', async () => {
    const agent1 = request.agent(app.getHttpServer());
    const agent2 = request.agent(app.getHttpServer());

    const login1 = await agent1
      .post('/auth/login')
      .set('User-Agent', 'E2E-Current-Device')
      .send({ loginOrEmail: login, password })
      .expect(200);

    await agent2
      .post('/auth/login')
      .set('User-Agent', 'E2E-Other-Device')
      .send({ loginOrEmail: login, password })
      .expect(200);

    await request(app.getHttpServer())
      .delete('/security/devices')
      .set('Authorization', `Bearer ${login1.body.accessToken}`)
      .expect(204);

    const devicesRes = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Authorization', `Bearer ${login1.body.accessToken}`)
      .expect(200);

    expect(devicesRes.body).toHaveLength(1);
    expect(devicesRes.body[0].title).toBe('E2E-Current-Device');
  });

  it('refresh with revoked device → 401', async () => {
    const agent = request.agent(app.getHttpServer());

    const loginRes = await agent
      .post('/auth/login')
      .set('User-Agent', 'E2E-Revoked-Device')
      .send({ loginOrEmail: login, password })
      .expect(200);

    const devicesRes = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(200);

    const deviceId = devicesRes.body[0].deviceId;

    await request(app.getHttpServer())
      .delete(`/security/devices/${deviceId}`)
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(204);

    await agent.post('/auth/refresh-token').expect(401);
  });
});
