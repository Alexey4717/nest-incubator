import { randomUUID } from 'crypto';
import { constants } from 'http2';

import { E2eContext, initSettings } from '@/__test__/setup/init-settings';
import { clearAllData } from '@/__test__/utils/db.helper';

describe('Security devices (e2e)', () => {
  let ctx: E2eContext;

  const login = 'secuser';
  const password = 'qwerty12';
  const email = 'secuser@test.dev';

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    if (ctx?.app) {
      await ctx.app.close();
    }
  });

  describe('GET /security/devices', () => {
    beforeAll(async () => {
      await clearAllData(ctx.app);
      await ctx.users.createSaUser({ login, password, email });
    });

    it('should return 401 if not auth — GET /security/devices without cookie', async () => {
      await ctx.auth
        .createSupertestAgent()
        .get('/security/devices')
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('2 logins same user (different User-Agent) → GET /security/devices returns 2 devices', async () => {
      const ua1 = 'Mozilla/5.0 E2E-Device-One';
      const ua2 = 'Mozilla/5.0 E2E-Device-Two';

      const { agent1 } = await ctx.auth.loginSameUserOnTwoDevices(login, password, [ua1, ua2]);

      const devicesRes = await agent1.get('/security/devices').expect(constants.HTTP_STATUS_OK);

      expect(devicesRes.body).toHaveLength(2);
      const titles = devicesRes.body.map((device: { title: string }) => device.title);
      expect(titles).toContain(ua1);
      expect(titles).toContain(ua2);
    });
  });

  describe('DELETE /security/devices/:deviceId', () => {
    beforeEach(async () => {
      await clearAllData(ctx.app);
      await ctx.users.createSaUser({ login, password, email });
    });

    it('DELETE /security/devices/:deviceId for other user device → 403', async () => {
      const otherLogin = 'secuser2';
      const otherEmail = 'secuser2@test.dev';

      await ctx.users
        .createUser({ login: otherLogin, password, email: otherEmail })
        .expect(constants.HTTP_STATUS_CREATED);

      const user1Agent = ctx.auth.createSupertestAgent();
      const user2Agent = ctx.auth.createSupertestAgent();

      await ctx.auth.loginWithAgent(user1Agent, login, password, { userAgent: 'User1-Device' });
      await ctx.auth.loginWithAgent(user2Agent, otherLogin, password, {
        userAgent: 'User2-Device',
      });

      const user2Devices = await user2Agent
        .get('/security/devices')
        .expect(constants.HTTP_STATUS_OK);

      const otherUserDeviceId = user2Devices.body[0].deviceId;

      await user1Agent
        .delete(`/security/devices/${otherUserDeviceId}`)
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('DELETE non-existent deviceId → 404', async () => {
      const agent = ctx.auth.createSupertestAgent();

      await ctx.auth.loginWithAgent(agent, login, password);

      await agent
        .delete(`/security/devices/${randomUUID()}`)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  describe('DELETE /security/devices and session revoke', () => {
    beforeEach(async () => {
      await clearAllData(ctx.app);
      await ctx.users.createSaUser({ login, password, email });
    });

    it('DELETE /security/devices → current device remains, others deleted', async () => {
      const { agent1 } = await ctx.auth.loginSameUserOnTwoDevices(login, password, [
        'E2E-Current-Device',
        'E2E-Other-Device',
      ]);

      await agent1.delete('/security/devices').expect(constants.HTTP_STATUS_NO_CONTENT);

      const devicesRes = await agent1.get('/security/devices').expect(constants.HTTP_STATUS_OK);

      expect(devicesRes.body).toHaveLength(1);
      expect(devicesRes.body[0].title).toBe('E2E-Current-Device');
    });

    it('refresh with revoked device → 401', async () => {
      const agent = ctx.auth.createSupertestAgent();

      await ctx.auth.loginWithAgent(agent, login, password, { userAgent: 'E2E-Revoked-Device' });

      const devicesRes = await agent.get('/security/devices').expect(constants.HTTP_STATUS_OK);

      const deviceId = devicesRes.body[0].deviceId;

      await agent.delete(`/security/devices/${deviceId}`).expect(constants.HTTP_STATUS_NO_CONTENT);

      await agent.post('/auth/refresh-token').expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });
});
