import { LoginCommand, LoginHandler } from './login.command';
import { LogoutCommand, LogoutHandler } from './logout.command';
import { NewPasswordCommand, NewPasswordHandler } from './new-password.command';
import { PasswordRecoveryCommand, PasswordRecoveryHandler } from './password-recovery.command';
import { RefreshTokenCommand, RefreshTokenHandler } from './refresh-token.command';
import {
  RegistrationConfirmationCommand,
  RegistrationConfirmationHandler,
} from './registration-confirmation.command';
import {
  RegistrationEmailResendingCommand,
  RegistrationEmailResendingHandler,
} from './registration-email-resending.command';
import { RegistrationCommand, RegistrationHandler } from './registration.command';

describe('auth command handlers', () => {
  it('LoginHandler delegates input to LoginUseCase', async () => {
    const loginUseCase = {
      execute: jest.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r' }),
    };
    const handler = new LoginHandler(loginUseCase as never);
    const input = { userId: 'u1', ip: '127.0.0.1', userAgent: 'ua' };

    await expect(handler.execute(new LoginCommand(input))).resolves.toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(loginUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('LogoutHandler delegates input to LogoutUseCase', async () => {
    const logoutUseCase = {
      execute: jest.fn().mockResolvedValue({ status: 'Success', data: null }),
    };
    const handler = new LogoutHandler(logoutUseCase as never);
    const input = {
      userId: 'u1',
      refreshTokenJWTPayload: { userId: 'u1', deviceId: 'd1', jti: 'j1', iat: 1 },
    };

    await handler.execute(new LogoutCommand(input));
    expect(logoutUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('RefreshTokenHandler delegates token to RefreshTokenUseCase', async () => {
    const refreshTokenUseCase = {
      execute: jest.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r' }),
    };
    const handler = new RefreshTokenHandler(refreshTokenUseCase as never);

    await handler.execute(new RefreshTokenCommand('token'));
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('token');
  });

  it('RegistrationHandler delegates input to RegistrationUseCase', async () => {
    const registrationUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const handler = new RegistrationHandler(registrationUseCase as never);
    const input = { login: 'l', email: 'e', password: 'p' };

    await handler.execute(new RegistrationCommand(input));
    expect(registrationUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('RegistrationConfirmationHandler delegates code', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const handler = new RegistrationConfirmationHandler(useCase as never);

    await handler.execute(new RegistrationConfirmationCommand('code'));
    expect(useCase.execute).toHaveBeenCalledWith('code');
  });

  it('RegistrationEmailResendingHandler delegates email', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ status: 'Success', data: null }) };
    const handler = new RegistrationEmailResendingHandler(useCase as never);

    await handler.execute(new RegistrationEmailResendingCommand('a@b.c'));
    expect(useCase.execute).toHaveBeenCalledWith('a@b.c');
  });

  it('PasswordRecoveryHandler delegates email', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const handler = new PasswordRecoveryHandler(useCase as never);

    await handler.execute(new PasswordRecoveryCommand('a@b.c'));
    expect(useCase.execute).toHaveBeenCalledWith('a@b.c');
  });

  it('NewPasswordHandler delegates input', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const handler = new NewPasswordHandler(useCase as never);
    const input = { recoveryCode: 'c', newPassword: 'p' };

    await handler.execute(new NewPasswordCommand(input));
    expect(useCase.execute).toHaveBeenCalledWith(input);
  });
});
