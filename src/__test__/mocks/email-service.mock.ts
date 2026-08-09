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

export function createEmailServiceMock(): EmailServiceMock {
  return {
    sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
    sendEmailWithNewConfirmationCode: jest.fn().mockResolvedValue(undefined),
    sendPasswordRecoveryCode: jest.fn().mockResolvedValue(undefined),
  };
}
