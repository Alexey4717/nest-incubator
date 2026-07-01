import { BadRequestException, Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { createBadRequestErrors } from '@/shared/utils/bad-request-errors';

import { UserQueryRepository } from '../../infrastructure/user-query.repository.mongodb';
import { UserRepository } from '../../infrastructure/user.repository.mongodb';
import { PasswordHasherService } from '../services/password-hasher.service';

type ChangePasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class ChangePasswordUseCase implements IUseCase<ChangePasswordInput, boolean> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async execute({ recoveryCode, newPassword }: ChangePasswordInput): Promise<boolean> {
    const user = await this.userQueryRepository.findUserByRecoveryCode(recoveryCode);
    if (
      !user ||
      !user?.recoveryData ||
      user.recoveryData?.recoveryCode !== recoveryCode ||
      user.recoveryData?.expirationDate <= new Date()
    ) {
      throw new BadRequestException(
        createBadRequestErrors({ message: 'Invalid recovery code', field: 'recoveryCode' }),
      );
    }
    const passwordHash = await this.passwordHasher.hash(newPassword);
    return this.userRepository.changeUserPasswordAndNullifyRecoveryData({
      userId: user?.id,
      passwordHash,
    });
  }
}
