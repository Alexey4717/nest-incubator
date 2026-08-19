import { Injectable } from '@nestjs/common';

import { DomainException } from '@/core/errors/domain.exception';
import { DomainEventPublisher } from '@/core/events/domain-event-publisher';
import { Notification } from '@/core/notification/notification';
import { BcryptService } from '@/core/services/bcrypt.service';
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
export class RegisterUserUseCase implements IUseCase<RegisterUserInput, Notification<UserModel>> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  async execute(input: RegisterUserInput): Promise<Notification<UserModel>> {
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
      await this.domainEventPublisher.publishUncommitted(newUser);
      return Notification.ok(fromEntity(saved));
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }
  }
}
