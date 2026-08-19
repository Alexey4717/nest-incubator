import { UserRegisteredEvent } from '@/modules/user/domain/events/user-registered.event';

import { SendRegistrationEmailHandler } from './send-registration-email.handler';

describe('SendRegistrationEmailHandler', () => {
  it('sends registration email with event payload', async () => {
    const emailService = { sendRegistrationEmail: jest.fn().mockResolvedValue(undefined) };
    const handler = new SendRegistrationEmailHandler(emailService as never);
    const event = new UserRegisteredEvent('user@example.com', 'login', 'code-1');

    await handler.handle(event);

    expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      'code-1',
    );
  });
});
