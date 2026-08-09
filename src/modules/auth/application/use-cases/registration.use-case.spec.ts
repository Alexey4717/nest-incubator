import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';

import { EmailService } from '@/modules/email/email.service';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user.use-case';

import { RegistrationUseCase } from './registration.use-case';

describe('RegistrationUseCase', () => {
  let useCase: RegistrationUseCase;
  let registerUserUseCase: { execute: jest.Mock };
  let emailService: { sendRegistrationEmail: jest.Mock };

  const input = {
    login: 'login',
    email: 'user@example.com',
    password: 'password1',
  };

  beforeEach(async () => {
    registerUserUseCase = { execute: jest.fn() };
    emailService = { sendRegistrationEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationUseCase,
        { provide: RegisterUserUseCase, useValue: registerUserUseCase },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get(RegistrationUseCase);
  });

  it('registers user and sends confirmation email', async () => {
    registerUserUseCase.execute.mockResolvedValue(
      Result.ok({
        email: 'user@example.com',
        login: 'login',
        confirmationCode: 'code-1',
      }),
    );
    emailService.sendRegistrationEmail.mockResolvedValue(undefined);

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(registerUserUseCase.execute).toHaveBeenCalledWith(input);
    expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      'code-1',
    );
  });

  it('sends empty confirmation code when it is null', async () => {
    registerUserUseCase.execute.mockResolvedValue(
      Result.ok({
        email: 'user@example.com',
        login: 'login',
        confirmationCode: null,
      }),
    );

    await useCase.execute(input);

    expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      '',
    );
  });

  it('throws DomainException when registration fails', async () => {
    registerUserUseCase.execute.mockResolvedValue(
      Result.fail(DomainExceptionCode.BadRequest, [
        { message: 'login already exists', field: 'login' },
      ]),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(DomainException);
    expect(emailService.sendRegistrationEmail).not.toHaveBeenCalled();
  });
});
