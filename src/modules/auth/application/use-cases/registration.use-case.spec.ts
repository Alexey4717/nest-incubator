import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user.use-case';

import { RegistrationUseCase } from './registration.use-case';

describe('RegistrationUseCase', () => {
  let useCase: RegistrationUseCase;
  let registerUserUseCase: { execute: jest.Mock };

  const input = {
    login: 'login',
    email: 'user@example.com',
    password: 'password1',
  };

  beforeEach(async () => {
    registerUserUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationUseCase,
        { provide: RegisterUserUseCase, useValue: registerUserUseCase },
      ],
    }).compile();

    useCase = module.get(RegistrationUseCase);
  });

  it('registers user via RegisterUserUseCase', async () => {
    registerUserUseCase.execute.mockResolvedValue(
      Notification.ok({
        email: 'user@example.com',
        login: 'login',
        confirmationCode: 'code-1',
      }),
    );

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(registerUserUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('throws DomainException when registration fails', async () => {
    registerUserUseCase.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'login already exists', field: 'login' },
      ]),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(DomainException);
  });
});
