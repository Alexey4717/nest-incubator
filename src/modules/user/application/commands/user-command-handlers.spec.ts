import { ChangePasswordCommand, ChangePasswordHandler } from './change-password.command';
import { ConfirmEmailCommand, ConfirmEmailHandler } from './confirm-email.command';
import { CreateUserCommand, CreateUserHandler } from './create-user.command';
import { DeleteUserCommand, DeleteUserHandler } from './delete-user.command';
import { RegisterUserCommand, RegisterUserHandler } from './register-user.command';

describe('user command handlers', () => {
  it('CreateUserHandler delegates input', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ status: 'Success' }) };
    const handler = new CreateUserHandler(useCase as never);
    const input = { login: 'l', email: 'e', password: 'p' } as never;

    await handler.execute(new CreateUserCommand(input));
    expect(useCase.execute).toHaveBeenCalledWith(input);
  });

  it('RegisterUserHandler delegates input', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ status: 'Success' }) };
    const handler = new RegisterUserHandler(useCase as never);
    const input = { login: 'l', email: 'e', password: 'p' };

    await handler.execute(new RegisterUserCommand(input));
    expect(useCase.execute).toHaveBeenCalledWith(input);
  });

  it('DeleteUserHandler delegates id', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ status: 'Success', data: null }) };
    const handler = new DeleteUserHandler(useCase as never);

    await handler.execute(new DeleteUserCommand('u1'));
    expect(useCase.execute).toHaveBeenCalledWith('u1');
  });

  it('ConfirmEmailHandler delegates code', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ status: 'Success', data: null }) };
    const handler = new ConfirmEmailHandler(useCase as never);

    await handler.execute(new ConfirmEmailCommand('code'));
    expect(useCase.execute).toHaveBeenCalledWith('code');
  });

  it('ChangePasswordHandler delegates input', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ status: 'Success', data: null }) };
    const handler = new ChangePasswordHandler(useCase as never);
    const input = { recoveryCode: 'c', newPassword: 'p' };

    await handler.execute(new ChangePasswordCommand(input));
    expect(useCase.execute).toHaveBeenCalledWith(input);
  });
});
