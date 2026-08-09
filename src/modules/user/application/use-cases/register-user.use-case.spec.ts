import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';
import { BcryptService } from '@/core/services/bcrypt.service';

import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../infrastructure/user.repository';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: { createUser: jest.Mock };
  let bcryptService: { generateHash: jest.Mock };

  const input = {
    login: 'login',
    email: 'user@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: UserRepository, useValue: { createUser: jest.fn() } },
        { provide: BcryptService, useValue: { generateHash: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
    userRepository = module.get(UserRepository);
    bcryptService = module.get(BcryptService);
  });

  it('registers user and returns mapped model', async () => {
    bcryptService.generateHash.mockResolvedValue('hashed');
    const saved = UserEntity.create({
      login: input.login,
      email: input.email,
      passwordHash: 'hashed',
      isConfirmed: false,
    });
    userRepository.createUser.mockResolvedValue(saved);

    const result = await useCase.execute(input);

    expect(bcryptService.generateHash).toHaveBeenCalledWith(input.password);
    expect(userRepository.createUser).toHaveBeenCalledWith(expect.any(UserEntity));
    expect(result).toMatchObject({
      status: ResultStatus.Success,
      data: {
        login: input.login,
        email: input.email,
        passwordHash: 'hashed',
        isConfirmed: false,
      },
    });
  });

  it('returns Result.fail when repository throws DomainException', async () => {
    bcryptService.generateHash.mockResolvedValue('hashed');
    userRepository.createUser.mockRejectedValue(
      new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'login already exists', field: 'login' },
      ]),
    );

    const result = await useCase.execute(input);

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ message: 'login already exists', field: 'login' }],
    });
  });

  it('rethrows unexpected errors from repository', async () => {
    bcryptService.generateHash.mockResolvedValue('hashed');
    userRepository.createUser.mockRejectedValue(new Error('db down'));

    await expect(useCase.execute(input)).rejects.toThrow('db down');
  });
});
