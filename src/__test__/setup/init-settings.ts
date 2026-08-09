import { INestApplication } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

import { AuthTestManager } from '@/modules/auth/__test__/auth-test-manager';
import { EmailService } from '@/modules/email/email.service';
import { UsersTestManager } from '@/modules/user/__test__/users-test-manager';

import { configApp } from '@/app/app.settings';
import { initAppModule } from '@/app/init-app-module';

import { createEmailServiceMock, EmailServiceMock } from '../mocks/email-service.mock';

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
