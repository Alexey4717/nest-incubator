import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class ConfirmEmailUseCase implements IUseCase<string, Notification<null>> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(code: string): Promise<Notification<null>> {
    const user = await this.userRepository.findByConfirmationCode(code);
    if (!user) {
      return Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }

    try {
      user.confirmEmail(code);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }

    const ok = await this.userRepository.save(user);
    if (!ok) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
