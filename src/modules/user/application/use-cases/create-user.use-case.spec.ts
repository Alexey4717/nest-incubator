import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';
import { BcryptService } from '@/core/services/bcrypt.service';

import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDTO } from '../../dto/create-user.dto';
import { UserRepository } from '../../infrastructure/user.repository';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: { createUser: jest.Mock };
  let bcryptService: { generateHash: jest.Mock };

  const makeDto = (): CreateUserDTO => {
    const dto = new CreateUserDTO();
    dto.login = 'login';
    dto.email = 'user@example.com';
    dto.password = 'password123';
    return dto;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: UserRepository, useValue: { createUser: jest.fn() } },
        { provide: BcryptService, useValue: { generateHash: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(CreateUserUseCase);
    userRepository = module.get(UserRepository);
    bcryptService = module.get(BcryptService);
  });

  it('creates confirmed user and returns mapped model', async () => {
    const dto = makeDto();
    bcryptService.generateHash.mockResolvedValue('hashed');
    const saved = UserEntity.create({
      login: dto.login,
      email: dto.email,
      passwordHash: 'hashed',
      isConfirmed: true,
    });
    userRepository.createUser.mockResolvedValue(saved);

    const result = await useCase.execute(dto);

    expect(bcryptService.generateHash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.createUser).toHaveBeenCalledWith(expect.any(UserEntity));
    expect(result).toMatchObject({
      status: ResultStatus.Success,
      data: {
        login: dto.login,
        email: dto.email,
        passwordHash: 'hashed',
        isConfirmed: true,
      },
    });
  });

  it('returns Result.fail when repository throws DomainException', async () => {
    bcryptService.generateHash.mockResolvedValue('hashed');
    userRepository.createUser.mockRejectedValue(
      new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'email already exists', field: 'email' },
      ]),
    );

    const result = await useCase.execute(makeDto());

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ message: 'email already exists', field: 'email' }],
    });
  });

  it('rethrows unexpected errors from repository', async () => {
    bcryptService.generateHash.mockResolvedValue('hashed');
    userRepository.createUser.mockRejectedValue(new Error('db down'));

    await expect(useCase.execute(makeDto())).rejects.toThrow('db down');
  });
});
