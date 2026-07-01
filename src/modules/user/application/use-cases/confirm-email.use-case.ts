import { BadRequestException, Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { createBadRequestErrors } from '@/shared/utils/bad-request-errors';

import { UserQueryRepository } from '../../infrastructure/user-query.repository.mongodb';
import { UserRepository } from '../../infrastructure/user.repository.mongodb';

@Injectable()
export class ConfirmEmailUseCase implements IUseCase<string, void> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(code: string): Promise<void> {
    const user = await this.userQueryRepository.findByConfirmationCode(code);
    if (!user) {
      throw new BadRequestException(
        createBadRequestErrors({ message: 'Confirmation code incorrect', field: 'code' }),
      );
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException(
        createBadRequestErrors({ message: 'Confirmation code incorrect', field: 'code' }),
      );
    }
    if (
      user.emailConfirmation.confirmationCode !== code ||
      user.emailConfirmation.expirationDate <= new Date()
    ) {
      throw new BadRequestException(
        createBadRequestErrors({ message: 'Confirmation code incorrect', field: 'code' }),
      );
    }
    const ok = await this.userRepository.updateConfirmation(user.id);
    if (!ok) {
      throw new BadRequestException(
        createBadRequestErrors({ message: 'Confirmation failed', field: 'code' }),
      );
    }
  }
}
