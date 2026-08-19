import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { BcryptService } from '@/core/services/bcrypt.service';
import { IUseCase } from '@/core/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository';

type ChangePasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class ChangePasswordUseCase implements IUseCase<ChangePasswordInput, Notification<null>> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({ recoveryCode, newPassword }: ChangePasswordInput): Promise<Notification<null>> {
    const user = await this.userRepository.findByRecoveryCode(recoveryCode);
    if (!user) {
      return Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]);
    }

    try {
      user.validateRecoveryCode(recoveryCode);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }

    const passwordHash = await this.bcryptService.generateHash(newPassword);
    user.changePassword(passwordHash);

    const ok = await this.userRepository.save(user);
    if (!ok) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
