import { Injectable } from '@nestjs/common';

import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { BcryptService } from '@/core/services/bcrypt.service';
import { IUseCase } from '@/core/types/use-case';

import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDTO } from '../../dto/create-user.dto';
import { fromEntity } from '../../infrastructure/user.mapper';
import { UserRepository } from '../../infrastructure/user.repository';
import { UserModel } from '../../models/user.model';

@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserDTO, ResultType<UserModel>> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(input: CreateUserDTO): Promise<ResultType<UserModel>> {
    const { login, email, password } = input;
    const passwordHash = await this.bcryptService.generateHash(password);
    const newUser = UserEntity.create({
      login,
      email,
      passwordHash,
      isConfirmed: true,
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
