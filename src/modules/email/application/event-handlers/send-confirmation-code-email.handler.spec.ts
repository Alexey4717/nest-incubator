import { UserConfirmationCodeUpdatedEvent } from '@/modules/user/domain/events/user-confirmation-code-updated.event';

import { SendConfirmationCodeEmailHandler } from './send-confirmation-code-email.handler';

describe('SendConfirmationCodeEmailHandler', () => {
  it('sends confirmation code email with event payload', async () => {
    const emailService = {
      sendEmailWithNewConfirmationCode: jest.fn().mockResolvedValue(undefined),
    };
    const handler = new SendConfirmationCodeEmailHandler(emailService as never);
    const event = new UserConfirmationCodeUpdatedEvent('user@example.com', 'login', 'code-2');

    await handler.handle(event);

    expect(emailService.sendEmailWithNewConfirmationCode).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      'code-2',
    );
  });
});
