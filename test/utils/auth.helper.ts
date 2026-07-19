import { INestApplication } from '@nestjs/common';
import { constants } from 'http2';
import request from 'supertest';

import { UserViewModel } from '../../src/modules/user/types/view-models';
import { ADMIN_BASIC_AUTH_HEADER } from './basic-auth.helper';
import { EmailServiceMock } from './e2e-application';
import { getLastConfirmationCode, getLastRecoveryCode } from './email-mock.helper';

export type SaUserInput = {
  login: string;
  password: string;
  email: string;
};

export type RegisterUserInput = SaUserInput;

export async function createSaUser(
  app: INestApplication,
  input: SaUserInput,
): Promise<UserViewModel> {
  const res = await request(app.getHttpServer())
    .post('/sa/users')
    .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
    .send(input)
    .expect(constants.HTTP_STATUS_CREATED);

  return res.body as UserViewModel;
}

export async function loginAndGetToken(
  app: INestApplication,
  loginOrEmail: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ loginOrEmail, password })
    .expect(constants.HTTP_STATUS_OK);

  return res.body.accessToken as string;
}

export async function registerUser(app: INestApplication, input: RegisterUserInput): Promise<void> {
  await request(app.getHttpServer())
    .post('/auth/registration')
    .send(input)
    .expect(constants.HTTP_STATUS_NO_CONTENT);
}

export async function confirmRegistration(
  app: INestApplication,
  emailMock: EmailServiceMock,
): Promise<void> {
  const code = getLastConfirmationCode(emailMock);

  await request(app.getHttpServer())
    .post('/auth/registration-confirmation')
    .send({ code })
    .expect(constants.HTTP_STATUS_NO_CONTENT);
}

export async function recoverPassword(app: INestApplication, email: string): Promise<void> {
  await request(app.getHttpServer())
    .post('/auth/password-recovery')
    .send({ email })
    .expect(constants.HTTP_STATUS_NO_CONTENT);
}

export async function setNewPassword(
  app: INestApplication,
  emailMock: EmailServiceMock,
  newPassword: string,
): Promise<void> {
  const recoveryCode = getLastRecoveryCode(emailMock);

  await request(app.getHttpServer())
    .post('/auth/new-password')
    .send({ newPassword, recoveryCode })
    .expect(constants.HTTP_STATUS_NO_CONTENT);
}
