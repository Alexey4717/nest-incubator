import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { RegisterUserCommand } from '@/modules/user/application/commands/register-user.command';

import { RegistrationUseCase } from './registration.use-case';

describe('RegistrationUseCase', () => {
  let useCase: RegistrationUseCase;
  let commandBus: { execute: jest.Mock };

  const input = {
    login: 'login',
    email: 'user@example.com',
    password: 'password1',
  };

  beforeEach(async () => {
    commandBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationUseCase, { provide: CommandBus, useValue: commandBus }],
    }).compile();

    useCase = module.get(RegistrationUseCase);
  });

  it('registers user via RegisterUserCommand', async () => {
    commandBus.execute.mockResolvedValue(
      Notification.ok({
        email: 'user@example.com',
        login: 'login',
        confirmationCode: 'code-1',
      }),
    );

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(RegisterUserCommand));
    expect(commandBus.execute.mock.calls[0][0].input).toEqual(input);
  });

  it('throws DomainException when registration fails', async () => {
    commandBus.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'login already exists', field: 'login' },
      ]),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(DomainException);
  });
});
