import { INestApplication } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

import { configApp } from '../../src/app/app.settings';
import { initAppModule } from '../../src/app/init-app-module';
import { EmailService } from '../../src/modules/email/email.service';
import { AuthTestManager } from './auth-test-manager';
import { UsersTestManager } from './users-test-manager';

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
  httpServer: ReturnType<INestApplication['getHttpServer']>;
  emailMock: EmailServiceMock;
  users: UsersTestManager;
  auth: AuthTestManager;
};

/** E2e-приложение с теми же middleware/pipes/swagger, что и в main; почта заглушена. */
export async function initSettings(
  configureModule?: (builder: TestingModuleBuilder) => void,
): Promise<E2eContext> {
  const emailMock = createEmailServiceMock();

  const dynamicAppModule = await initAppModule();

  const builder = Test.createTestingModule({
    imports: [dynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useValue(emailMock);

  configureModule?.(builder);

  const moduleFixture: TestingModule = await builder.compile();

  const app = moduleFixture.createNestApplication();
  await configApp(app);

  const httpServer = app.getHttpServer();

  return {
    app,
    httpServer,
    emailMock,
    users: new UsersTestManager(app),
    auth: new AuthTestManager(app, emailMock),
  };
}
