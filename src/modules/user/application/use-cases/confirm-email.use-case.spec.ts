import { Test, TestingModule } from '@nestjs/testing';
import { add } from 'date-fns';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { ResultStatus } from '@/core/result/result.types';

import { UserDb, UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../infrastructure/user.repository';
import { ConfirmEmailUseCase } from './confirm-email.use-case';

describe('ConfirmEmailUseCase', () => {
  let useCase: ConfirmEmailUseCase;
  let userRepository: {
    findByConfirmationCode: jest.Mock;
    save: jest.Mock;
  };

  const baseDb = (overrides: Partial<UserDb> = {}): UserDb => ({
    id: 'user-1',
    login: 'login',
    email: 'a@b.c',
    passwordHash: 'hash',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    confirmationCode: 'code-1',
    confirmationExpiration: add(new Date(), { hours: 1 }),
    isConfirmed: false,
    recoveryCode: null,
    recoveryExpiration: null,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmEmailUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByConfirmationCode: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ConfirmEmailUseCase);
    userRepository = module.get(UserRepository);
  });

  it('confirms email and returns success', async () => {
    const user = UserEntity.reconstitute(baseDb({ confirmationCode: 'valid-code' }));
    userRepository.findByConfirmationCode.mockResolvedValue(user);
    userRepository.save.mockResolvedValue(true);

    const result = await useCase.execute('valid-code');

    expect(userRepository.findByConfirmationCode).toHaveBeenCalledWith('valid-code');
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(user.isEmailConfirmed()).toBe(true);
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });

  it('returns BadRequest when confirmation code is not found', async () => {
    userRepository.findByConfirmationCode.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ message: 'Confirmation code incorrect', field: 'code' }],
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('returns Result.fail when confirmEmail throws DomainException', async () => {
    const user = UserEntity.reconstitute(baseDb({ isConfirmed: true }));
    userRepository.findByConfirmationCode.mockResolvedValue(user);

    const result = await useCase.execute('code-1');

    expect(result).toMatchObject({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ field: 'code' }],
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when save fails', async () => {
    const user = UserEntity.reconstitute(baseDb({ confirmationCode: 'valid-code' }));
    userRepository.findByConfirmationCode.mockResolvedValue(user);
    userRepository.save.mockResolvedValue(false);

    await expect(useCase.execute('valid-code')).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
