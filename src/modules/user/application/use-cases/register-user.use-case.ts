import { Injectable } from '@nestjs/common';

import { BcryptService } from '@/core/application/bcrypt.service';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { UserEntity } from '../../domain/entities/user.entity';
import { fromEntity } from '../../infrastructure/user.mapper';
import { UserRepository } from '../../infrastructure/user.repository';
import { UserModel } from '../../models/user.model';

type RegisterUserInput = {
  login: string;
  email: string;
  password: string;
};

@Injectable()
export class RegisterUserUseCase implements IUseCase<RegisterUserInput, ResultType<UserModel>> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(input: RegisterUserInput): Promise<ResultType<UserModel>> {
    const { login, email, password } = input;
    const passwordHash = await this.bcryptService.generateHash(password);
    const newUser = UserEntity.create({
      login,
      email,
      passwordHash,
      isConfirmed: false,
    });

    try {
      const saved = await this.userRepository.createUser(newUser);
      return Result.ok(fromEntity(saved));
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }
  }
}
