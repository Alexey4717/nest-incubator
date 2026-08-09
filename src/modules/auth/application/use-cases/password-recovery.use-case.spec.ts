import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '@/modules/email/email.service';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';
import { UserModel } from '@/modules/user/models/user.model';

import { PasswordRecoveryUseCase } from './password-recovery.use-case';

function makeUser(overrides: Partial<UserModel> = {}): UserModel {
  return {
    id: 'user-1',
    login: 'login',
    email: 'user@example.com',
    passwordHash: 'hash',
    createdAt: '2024-01-01T00:00:00.000Z',
    confirmationCode: null,
    confirmationExpiration: null,
    isConfirmed: true,
    recoveryCode: null,
    recoveryExpiration: null,
    ...overrides,
  };
}

describe('PasswordRecoveryUseCase', () => {
  let useCase: PasswordRecoveryUseCase;
  let userQueryRepository: { findUserByEmail: jest.Mock };
  let userRepository: { save: jest.Mock };
  let emailService: { sendPasswordRecoveryCode: jest.Mock };

  beforeEach(async () => {
    userQueryRepository = { findUserByEmail: jest.fn() };
    userRepository = { save: jest.fn() };
    emailService = { sendPasswordRecoveryCode: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordRecoveryUseCase,
        { provide: UserQueryRepository, useValue: userQueryRepository },
        { provide: UserRepository, useValue: userRepository },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get(PasswordRecoveryUseCase);
  });

  it('returns null when user is not found', async () => {
    userQueryRepository.findUserByEmail.mockResolvedValue(null);

    await expect(useCase.execute('missing@example.com')).resolves.toBeNull();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(emailService.sendPasswordRecoveryCode).not.toHaveBeenCalled();
  });

  it('saves recovery data and sends email when user exists', async () => {
    userQueryRepository.findUserByEmail.mockResolvedValue(makeUser());
    userRepository.save.mockResolvedValue(undefined);
    emailService.sendPasswordRecoveryCode.mockResolvedValue(undefined);

    await expect(useCase.execute('user@example.com')).resolves.toBeUndefined();

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailService.sendPasswordRecoveryCode).toHaveBeenCalledWith(
      'user@example.com',
      'login',
      expect.any(String),
    );
  });
});
