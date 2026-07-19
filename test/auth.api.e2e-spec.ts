import { constants } from 'http2';
import request from 'supertest';

import { clearAllData } from './helpers/db.helper';
import { getLastConfirmationCode } from './helpers/email-mock.helper';
import { E2eContext, initSettings } from './helpers/init-settings';
import { invalidInputData } from './helpers/invalid-input-data';

describe('Auth API (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);
    jest.clearAllMocks();
  });

  // testing post '/auth/registration' api
  describe('POST /auth/registration', () => {
    it('should register user — 204', async () => {
      await ctx.auth.registerUser({
        login: 'reguser1',
        email: 'reguser1@test.dev',
        password: 'qwerty12',
      });

      expect(ctx.emailMock.sendRegistrationEmail).toHaveBeenCalledTimes(1);
    });

    it.each(invalidInputData.auth.registration)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.httpServer)
          .post('/auth/registration')
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );

    it('should return 400 if login already exists', async () => {
      await ctx.auth.registerUser({
        login: 'dupuser',
        email: 'dupuser1@test.dev',
        password: 'qwerty12',
      });

      const res = await request(ctx.httpServer)
        .post('/auth/registration')
        .send({
          login: 'dupuser',
          email: 'dupuser2@test.dev',
          password: 'qwerty12',
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'login' })]),
      );
    });

    it('should return 400 if email already exists', async () => {
      await ctx.auth.registerUser({
        login: 'dupuser1',
        email: 'same@test.dev',
        password: 'qwerty12',
      });

      const res = await request(ctx.httpServer)
        .post('/auth/registration')
        .send({
          login: 'dupuser2',
          email: 'same@test.dev',
          password: 'qwerty12',
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      );
    });
  });

  // testing post '/auth/registration-confirmation' api
  describe('POST /auth/registration-confirmation', () => {
    it('should confirm registration — 204', async () => {
      await ctx.auth.registerUser({
        login: 'confuser',
        email: 'confuser@test.dev',
        password: 'qwerty12',
      });

      await ctx.auth.confirmRegistration();

      const token = await ctx.auth.loginAndGetToken('confuser', 'qwerty12');
      expect(token).toEqual(expect.any(String));
    });

    it('should return 400 for incorrect code', async () => {
      await ctx.auth.registerUser({
        login: 'confuser2',
        email: 'confuser2@test.dev',
        password: 'qwerty12',
      });

      await request(ctx.httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: '00000000-0000-0000-0000-000000000099' })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });
  });

  // testing post '/auth/registration-email-resending' api
  describe('POST /auth/registration-email-resending', () => {
    it('should resend confirmation email — 204', async () => {
      await ctx.auth.registerUser({
        login: 'resenduser',
        email: 'resenduser@test.dev',
        password: 'qwerty12',
      });

      await request(ctx.httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: 'resenduser@test.dev' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      expect(ctx.emailMock.sendEmailWithNewConfirmationCode).toHaveBeenCalledTimes(1);
      expect(getLastConfirmationCode(ctx.emailMock)).toEqual(expect.any(String));
    });

    it('should confirm with resent code — 204', async () => {
      await ctx.auth.registerUser({
        login: 'rsndusr02',
        email: 'rsndusr02@test.dev',
        password: 'qwerty12',
      });

      await request(ctx.httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: 'rsndusr02@test.dev' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await ctx.auth.confirmRegistration();

      await ctx.auth.loginAndGetToken('rsndusr02', 'qwerty12');
    });

    it('should return 400 if email not registered', async () => {
      const res = await request(ctx.httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: 'unknown@test.dev' })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      );
    });

    it('should return 400 if email already confirmed', async () => {
      await ctx.users.createSaUser({
        login: 'confirmed',
        email: 'confirmed@test.dev',
        password: 'qwerty12',
      });

      const res = await request(ctx.httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: 'confirmed@test.dev' })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      );
    });
  });

  // testing post '/auth/password-recovery' api
  describe('POST /auth/password-recovery', () => {
    it('should send recovery email for existing user — 204', async () => {
      await ctx.users.createSaUser({
        login: 'recover1',
        email: 'recover1@test.dev',
        password: 'qwerty12',
      });

      await ctx.auth.recoverPassword('recover1@test.dev');

      expect(ctx.emailMock.sendPasswordRecoveryCode).toHaveBeenCalledTimes(1);
    });

    it('should return 204 for unknown email (no leak)', async () => {
      await request(ctx.httpServer)
        .post('/auth/password-recovery')
        .send({ email: 'unknown@test.dev' })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      expect(ctx.emailMock.sendPasswordRecoveryCode).not.toHaveBeenCalled();
    });
  });

  // testing post '/auth/new-password' api
  describe('POST /auth/new-password', () => {
    it('should set new password — 204', async () => {
      await ctx.users.createSaUser({
        login: 'newpass1',
        email: 'newpass1@test.dev',
        password: 'qwerty12',
      });

      await ctx.auth.recoverPassword('newpass1@test.dev');
      await ctx.auth.setNewPassword('newpass99');

      await ctx.auth.loginAndGetToken('newpass1', 'newpass99');
    });

    it.each(invalidInputData.auth.newPassword)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.httpServer)
          .post('/auth/new-password')
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );
  });

  // testing post '/auth/login' api
  describe('POST /auth/login', () => {
    it('should return 401 for unconfirmed user', async () => {
      await ctx.auth.registerUser({
        login: 'unconf',
        email: 'unconf@test.dev',
        password: 'qwerty12',
      });

      await request(ctx.httpServer)
        .post('/auth/login')
        .send({ loginOrEmail: 'unconf', password: 'qwerty12' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it.each(invalidInputData.auth.login)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.httpServer)
          .post('/auth/login')
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );
  });

  // testing get '/auth/me' api
  describe('GET /auth/me', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer).get('/auth/me').expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return current user — 200', async () => {
      await ctx.users.createSaUser({
        login: 'meuser',
        email: 'meuser@test.dev',
        password: 'qwerty12',
      });

      const accessToken = await ctx.auth.loginAndGetToken('meuser', 'qwerty12');

      const res = await request(ctx.httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        login: 'meuser',
        email: 'meuser@test.dev',
        userId: expect.any(String),
      });
    });
  });
});
