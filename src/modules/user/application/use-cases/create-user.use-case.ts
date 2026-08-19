import { Injectable } from '@nestjs/common';

import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { BcryptService } from '@/core/services/bcrypt.service';
import { IUseCase } from '@/core/types/use-case';

import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDTO } from '../../dto/create-user.dto';
import { fromEntity } from '../../infrastructure/user.mapper';
import { UserRepository } from '../../infrastructure/user.repository';
import { UserModel } from '../../models/user.model';

@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserDTO, Notification<UserModel>> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(input: CreateUserDTO): Promise<Notification<UserModel>> {
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
      return Notification.ok(fromEntity(saved));
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }
  }
}
