import { EmailServiceMock } from '../mocks/email-service.mock';

export function getLastConfirmationCode(emailMock: EmailServiceMock): string {
  const regOrder = emailMock.sendRegistrationEmail.mock.invocationCallOrder.at(-1) ?? -1;
  const resendOrder =
    emailMock.sendEmailWithNewConfirmationCode.mock.invocationCallOrder.at(-1) ?? -1;

  if (resendOrder > regOrder) {
    const calls = emailMock.sendEmailWithNewConfirmationCode.mock.calls;
    return calls[calls.length - 1][2] as string;
  }

  const calls = emailMock.sendRegistrationEmail.mock.calls;
  if (calls.length === 0) {
    throw new Error('No confirmation email was sent');
  }

  return calls[calls.length - 1][2] as string;
}

export function getLastRecoveryCode(emailMock: EmailServiceMock): string {
  const calls = emailMock.sendPasswordRecoveryCode.mock.calls;
  if (calls.length === 0) {
    throw new Error('No recovery email was sent');
  }

  return calls[calls.length - 1][2] as string;
}
