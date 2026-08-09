import { Test, TestingModule } from '@nestjs/testing';

import { BcryptService } from '@/core/services/bcrypt.service';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserModel } from '../../models/user.model';
import { CheckCredentialsUseCase } from './check-credentials.use-case';

describe('CheckCredentialsUseCase', () => {
  let useCase: CheckCredentialsUseCase;
  let userQueryRepository: { findByLoginOrEmail: jest.Mock };
  let bcryptService: { compare: jest.Mock };

  const confirmedUser: UserModel = {
    id: 'user-1',
    login: 'login',
    email: 'user@example.com',
    passwordHash: 'hashed',
    createdAt: '2020-01-01T00:00:00.000Z',
    confirmationCode: null,
    confirmationExpiration: null,
    isConfirmed: true,
    recoveryCode: null,
    recoveryExpiration: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckCredentialsUseCase,
        {
          provide: UserQueryRepository,
          useValue: { findByLoginOrEmail: jest.fn() },
        },
        { provide: BcryptService, useValue: { compare: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(CheckCredentialsUseCase);
    userQueryRepository = module.get(UserQueryRepository);
    bcryptService = module.get(BcryptService);
  });

  it('returns user when credentials are valid', async () => {
    userQueryRepository.findByLoginOrEmail.mockResolvedValue(confirmedUser);
    bcryptService.compare.mockResolvedValue(true);

    const result = await useCase.execute({
      loginOrEmail: 'login',
      password: 'password123',
    });

    expect(userQueryRepository.findByLoginOrEmail).toHaveBeenCalledWith('login');
    expect(bcryptService.compare).toHaveBeenCalledWith('password123', 'hashed');
    expect(result).toBe(confirmedUser);
  });

  it('returns null when user is not found', async () => {
    userQueryRepository.findByLoginOrEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      loginOrEmail: 'missing',
      password: 'password123',
    });

    expect(result).toBeNull();
    expect(bcryptService.compare).not.toHaveBeenCalled();
  });

  it('returns null when passwordHash is missing', async () => {
    userQueryRepository.findByLoginOrEmail.mockResolvedValue({
      ...confirmedUser,
      passwordHash: '',
    });

    const result = await useCase.execute({
      loginOrEmail: 'login',
      password: 'password123',
    });

    expect(result).toBeNull();
    expect(bcryptService.compare).not.toHaveBeenCalled();
  });

  it('returns null when email is not confirmed', async () => {
    userQueryRepository.findByLoginOrEmail.mockResolvedValue({
      ...confirmedUser,
      isConfirmed: false,
    });

    const result = await useCase.execute({
      loginOrEmail: 'login',
      password: 'password123',
    });

    expect(result).toBeNull();
    expect(bcryptService.compare).not.toHaveBeenCalled();
  });

  it('returns null when password is invalid', async () => {
    userQueryRepository.findByLoginOrEmail.mockResolvedValue(confirmedUser);
    bcryptService.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      loginOrEmail: 'login',
      password: 'wrong',
    });

    expect(result).toBeNull();
  });
});
