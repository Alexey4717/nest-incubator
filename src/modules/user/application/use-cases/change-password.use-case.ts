import { Injectable } from '@nestjs/common';

import { BcryptService } from '@/core/application/bcrypt.service';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { IUseCase } from '@/core/types/use-case';

import { UserEntity } from '../../domain/entities/user.entity';
import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { modelToDb } from '../../infrastructure/user.mapper';
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
    const found = await this.userQueryRepository.findUserByRecoveryCode(recoveryCode);
    if (!found) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]);
    }

    const user = UserEntity.reconstitute(modelToDb(found));
    user.validateRecoveryCode(recoveryCode);
    const passwordHash = await this.bcryptService.generateHash(newPassword);
    user.changePassword(passwordHash);
    return this.userRepository.save(user);
  }
}
