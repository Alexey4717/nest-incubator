import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { DomainEventPublisher } from '@/core/events/domain-event-publisher';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { modelToDb } from '@/modules/user/infrastructure/user.mapper';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';

@Injectable()
export class RegistrationEmailResendingUseCase implements IUseCase<string, ResultType<null>> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  async execute(email: string): Promise<ResultType<null>> {
    const found = await this.userQueryRepository.findUserByEmail(email);
    if (!found) {
      return Result.fail(DomainExceptionCode.BadRequest, [
        { message: 'email not registered', field: 'email' },
      ]);
    }

    const user = UserEntity.reconstitute(modelToDb(found));

    try {
      user.assertNotConfirmed();
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    const newConfirmationCode = randomUUID();
    user.updateConfirmationCode(newConfirmationCode);
    await this.userRepository.save(user);
    await this.domainEventPublisher.publishUncommitted(user);

    return Result.ok(null);
  }
}
