import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { appSettings } from '../../src/app/app.settings';
import { initAppModule } from '../../src/app/init-app-module';
import { EmailService } from '../../src/modules/email/email.service';

export function createEmailServiceMock(): Pick<
  EmailService,
  'sendRegistrationEmail' | 'sendEmailWithNewConfirmationCode' | 'sendPasswordRecoveryCode'
> {
  return {
    sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
    sendEmailWithNewConfirmationCode: jest.fn().mockResolvedValue(undefined),
    sendPasswordRecoveryCode: jest.fn().mockResolvedValue(undefined),
  };
}

/** E2e-приложение с теми же middleware/pipes/swagger, что и в main; почта заглушена. */
export async function createE2eApplication(): Promise<INestApplication> {
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
  return app;
}
