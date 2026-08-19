import { UserPasswordRecoveryRequestedEvent } from '@/modules/user/domain/events/user-password-recovery-requested.event';

import { SendPasswordRecoveryEmailHandler } from './send-password-recovery-email.handler';

describe('SendPasswordRecoveryEmailHandler', () => {
  it('sends password recovery email with event payload', async () => {
    const emailService = { sendPasswordRecoveryCode: jest.fn().mockResolvedValue(undefined) };
    const handler = new SendPasswordRecoveryEmailHandler(emailService as never);
    const event = new UserPasswordRecoveryRequestedEvent('user@example.com', 'login', 'rec-1');

    await handler.handle(event);

    expect(emailService.sendPasswordRecoveryCode).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      'rec-1',
    );
  });
});
