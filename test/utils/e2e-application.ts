import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { appSettings, setupClassValidatorContainer } from '../../src/app/app.settings';
import { initAppModule } from '../../src/app/init-app-module';
import { EmailService } from '../../src/modules/email/email.service';

export function createEmailServiceMock(): EmailServiceMock {
  return {
    sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
    sendEmailWithNewConfirmationCode: jest.fn().mockResolvedValue(undefined),
    sendPasswordRecoveryCode: jest.fn().mockResolvedValue(undefined),
  };
}

export type EmailServiceMock = {
  sendRegistrationEmail: jest.Mock<
    Promise<void>,
    [email: string, login: string, confirmationCode: string]
  >;
  sendEmailWithNewConfirmationCode: jest.Mock<
    Promise<void>,
    [email: string, login: string, confirmationCode: string]
  >;
  sendPasswordRecoveryCode: jest.Mock<
    Promise<void>,
    [email: string, login: string, recoveryCode: string]
  >;
};

export type E2eContext = {
  app: INestApplication;
  emailMock: EmailServiceMock;
};

/** E2e-приложение с теми же middleware/pipes/swagger, что и в main; почта заглушена. */
export async function createE2eApplication(): Promise<E2eContext> {
  const emailMock = createEmailServiceMock();

  const dynamicAppModule = await initAppModule();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [dynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useValue(emailMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  appSettings(app);
  await app.init();
  setupClassValidatorContainer(app);
  return { app, emailMock };
}
