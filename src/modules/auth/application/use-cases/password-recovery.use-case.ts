import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { DomainEventPublisher } from '@/core/events/domain-event-publisher';
import { IUseCase } from '@/core/types/use-case';

import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { modelToDb } from '@/modules/user/infrastructure/user.mapper';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';

@Injectable()
export class PasswordRecoveryUseCase implements IUseCase<string, void | null> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  async execute(email: string): Promise<void | null> {
    const found = await this.userQueryRepository.findUserByEmail(email);
    if (!found) return null;

    const user = UserEntity.reconstitute(modelToDb(found));
    const recoveryCode = randomUUID();
    user.setRecoveryData({
      recoveryCode,
      recoveryExpiration: add(new Date(), { hours: 1 }),
    });
    await this.userRepository.save(user);
    await this.domainEventPublisher.publishUncommitted(user);
  }
}
