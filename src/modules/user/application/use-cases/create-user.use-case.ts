import { Injectable } from '@nestjs/common';

import { BcryptService } from '@/shared/core/application/bcrypt.service';
import { IUseCase } from '@/shared/types/use-case';

import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDTO } from '../../dto/create-user.dto';
import { fromEntity } from '../../infrastructure/user.mapper';
import { UserRepository } from '../../infrastructure/user.repository';
import { UserModel } from '../../models/user.model';

@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserDTO, UserModel> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(input: CreateUserDTO): Promise<UserModel> {
    const { login, email, password } = input;
    const passwordHash = await this.bcryptService.generateHash(password);
    const newUser = UserEntity.create({
      login,
      email,
      passwordHash,
      isConfirmed: true,
    });

    const saved = await this.userRepository.createUser(newUser);
    return fromEntity(saved);
  }
}
