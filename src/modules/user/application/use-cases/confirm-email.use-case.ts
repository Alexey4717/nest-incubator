import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';

import { UserEntity } from '../../domain/entities/user.entity';
import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { modelToDb } from '../../infrastructure/user.mapper';
import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class ConfirmEmailUseCase implements IUseCase<string, void> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(code: string): Promise<void> {
    const found = await this.userQueryRepository.findByConfirmationCode(code);
    if (!found) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }

    const user = UserEntity.reconstitute(modelToDb(found));
    user.confirmEmail(code);

    const ok = await this.userRepository.save(user);
    if (!ok) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation failed', field: 'code' },
      ]);
    }
  }
}
