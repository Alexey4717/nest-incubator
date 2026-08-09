import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { ResultStatus } from '@/core/result/result.types';

import { EmailService } from '@/modules/email/email.service';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';
import { UserModel } from '@/modules/user/models/user.model';

import { RegistrationEmailResendingUseCase } from './registration-email-resending.use-case';

function makeUser(overrides: Partial<UserModel> = {}): UserModel {
  return {
    id: 'user-1',
    login: 'login',
    email: 'user@example.com',
    passwordHash: 'hash',
    createdAt: '2024-01-01T00:00:00.000Z',
    confirmationCode: 'old-code',
    confirmationExpiration: new Date('2099-01-01T00:00:00.000Z'),
    isConfirmed: false,
    recoveryCode: null,
    recoveryExpiration: null,
    ...overrides,
  };
}

describe('RegistrationEmailResendingUseCase', () => {
  let useCase: RegistrationEmailResendingUseCase;
  let userQueryRepository: { findUserByEmail: jest.Mock };
  let userRepository: { save: jest.Mock };
  let emailService: { sendEmailWithNewConfirmationCode: jest.Mock };

  beforeEach(async () => {
    userQueryRepository = { findUserByEmail: jest.fn() };
    userRepository = { save: jest.fn() };
    emailService = { sendEmailWithNewConfirmationCode: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationEmailResendingUseCase,
        { provide: UserQueryRepository, useValue: userQueryRepository },
        { provide: UserRepository, useValue: userRepository },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get(RegistrationEmailResendingUseCase);
  });

  it('returns BadRequest when email is not registered', async () => {
    userQueryRepository.findUserByEmail.mockResolvedValue(null);

    const result = await useCase.execute('missing@example.com');

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ message: 'email not registered', field: 'email' }],
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('returns BadRequest when email is already confirmed', async () => {
    userQueryRepository.findUserByEmail.mockResolvedValue(makeUser({ isConfirmed: true }));

    const result = await useCase.execute('user@example.com');

    expect(result.status).toBe(ResultStatus.Failure);
    expect(result).toMatchObject({
      code: DomainExceptionCode.BadRequest,
      extensions: [{ message: 'email already confirmed', field: 'email' }],
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('updates confirmation code and sends email for unconfirmed user', async () => {
    userQueryRepository.findUserByEmail.mockResolvedValue(makeUser());
    userRepository.save.mockResolvedValue(undefined);
    emailService.sendEmailWithNewConfirmationCode.mockResolvedValue(undefined);

    const result = await useCase.execute('user@example.com');

    expect(result).toEqual({ status: ResultStatus.Success, data: null });
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailService.sendEmailWithNewConfirmationCode).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      expect.any(String),
    );
  });
});
