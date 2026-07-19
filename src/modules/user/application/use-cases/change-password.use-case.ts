import { Injectable } from '@nestjs/common';

import { BcryptService } from '@/shared/core/application/bcrypt.service';
import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserRepository } from '../../infrastructure/user.repository';

type ChangePasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class ChangePasswordUseCase implements IUseCase<ChangePasswordInput, boolean> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({ recoveryCode, newPassword }: ChangePasswordInput): Promise<boolean> {
    const user = await this.userQueryRepository.findUserByRecoveryCode(recoveryCode);
    if (
      !user ||
      !user.recoveryCode ||
      user.recoveryCode !== recoveryCode ||
      !user.recoveryExpiration ||
      user.recoveryExpiration <= new Date()
    ) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]);
    }
    const passwordHash = await this.bcryptService.generateHash(newPassword);
    return this.userRepository.changeUserPasswordAndNullifyRecoveryData({
      userId: user.id,
      passwordHash,
    });
  }
}
