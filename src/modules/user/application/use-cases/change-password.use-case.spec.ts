import { Test, TestingModule } from '@nestjs/testing';
import { add } from 'date-fns';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { ResultStatus } from '@/core/result/result.types';
import { BcryptService } from '@/core/services/bcrypt.service';

import { UserDb, UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../infrastructure/user.repository';
import { ChangePasswordUseCase } from './change-password.use-case';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: {
    findByRecoveryCode: jest.Mock;
    save: jest.Mock;
  };
  let bcryptService: { generateHash: jest.Mock };

  const input = {
    recoveryCode: 'recovery-1',
    newPassword: 'newPassword1',
  };

  const baseDb = (overrides: Partial<UserDb> = {}): UserDb => ({
    id: 'user-1',
    login: 'login',
    email: 'a@b.c',
    passwordHash: 'old-hash',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    confirmationCode: null,
    confirmationExpiration: null,
    isConfirmed: true,
    recoveryCode: 'recovery-1',
    recoveryExpiration: add(new Date(), { hours: 1 }),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByRecoveryCode: jest.fn(),
            save: jest.fn(),
          },
        },
        { provide: BcryptService, useValue: { generateHash: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(ChangePasswordUseCase);
    userRepository = module.get(UserRepository);
    bcryptService = module.get(BcryptService);
  });

  it('changes password and clears recovery data', async () => {
    const user = UserEntity.reconstitute(baseDb());
    userRepository.findByRecoveryCode.mockResolvedValue(user);
    bcryptService.generateHash.mockResolvedValue('new-hash');
    userRepository.save.mockResolvedValue(true);

    const result = await useCase.execute(input);

    expect(userRepository.findByRecoveryCode).toHaveBeenCalledWith(input.recoveryCode);
    expect(bcryptService.generateHash).toHaveBeenCalledWith(input.newPassword);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(user.toDb()).toMatchObject({
      passwordHash: 'new-hash',
      recoveryCode: null,
      recoveryExpiration: null,
    });
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });

  it('returns BadRequest when recovery code is not found', async () => {
    userRepository.findByRecoveryCode.mockResolvedValue(null);

    const result = await useCase.execute(input);

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ message: 'Invalid recovery code', field: 'recoveryCode' }],
    });
    expect(bcryptService.generateHash).not.toHaveBeenCalled();
  });

  it('returns Result.fail when recovery code is expired', async () => {
    const user = UserEntity.reconstitute(
      baseDb({ recoveryExpiration: add(new Date(), { hours: -1 }) }),
    );
    userRepository.findByRecoveryCode.mockResolvedValue(user);

    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ field: 'recoveryCode' }],
    });
    expect(bcryptService.generateHash).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when save fails', async () => {
    const user = UserEntity.reconstitute(baseDb());
    userRepository.findByRecoveryCode.mockResolvedValue(user);
    bcryptService.generateHash.mockResolvedValue('new-hash');
    userRepository.save.mockResolvedValue(false);

    await expect(useCase.execute(input)).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
