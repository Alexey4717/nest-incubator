import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class ConfirmEmailUseCase implements IUseCase<string, void> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(code: string): Promise<void> {
    const user = await this.userQueryRepository.findByConfirmationCode(code);
    if (!user) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }
    if (user.isConfirmed) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }
    if (
      user.confirmationCode !== code ||
      !user.confirmationExpiration ||
      user.confirmationExpiration <= new Date()
    ) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }
    const ok = await this.userRepository.updateConfirmation(user.id);
    if (!ok) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation failed', field: 'code' },
      ]);
    }
  }
}
