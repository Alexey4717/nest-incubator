import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { IUseCase } from '@/core/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class ConfirmEmailUseCase implements IUseCase<string, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(code: string): Promise<void> {
    const user = await this.userRepository.findByConfirmationCode(code);
    if (!user) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }

    user.confirmEmail(code);

    const ok = await this.userRepository.save(user);
    if (!ok) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }
  }
}
