import { Injectable } from '@nestjs/common';

import { BcryptService } from '@/core/application/bcrypt.service';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository';

type ChangePasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class ChangePasswordUseCase implements IUseCase<ChangePasswordInput, ResultType<null>> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({ recoveryCode, newPassword }: ChangePasswordInput): Promise<ResultType<null>> {
    const user = await this.userRepository.findByRecoveryCode(recoveryCode);
    if (!user) {
      return Result.fail(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]);
    }

    try {
      user.validateRecoveryCode(recoveryCode);
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    const passwordHash = await this.bcryptService.generateHash(newPassword);
    user.changePassword(passwordHash);

    const ok = await this.userRepository.save(user);
    if (!ok) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(null);
  }
}
