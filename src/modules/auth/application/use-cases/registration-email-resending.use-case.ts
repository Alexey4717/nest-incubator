import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { EmailService } from '@/modules/email/email.service';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { modelToDb } from '@/modules/user/infrastructure/user.mapper';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';

@Injectable()
export class RegistrationEmailResendingUseCase implements IUseCase<string, ResultType<null>> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<ResultType<null>> {
    const found = await this.userQueryRepository.findUserByEmail(email);
    if (!found) {
      return Result.fail(DomainExceptionCode.BadRequest, [
        { message: 'email not registered', field: 'email' },
      ]);
    }

    const user = UserEntity.reconstitute(modelToDb(found));

    try {
      user.assertNotConfirmed();
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    const newConfirmationCode = randomUUID();
    user.updateConfirmationCode(newConfirmationCode);
    await this.userRepository.save(user);

    const data = user.toDb();
    await this.emailService.sendEmailWithNewConfirmationCode(
      data.email,
      data.login,
      newConfirmationCode,
    );

    return Result.ok(null);
  }
}
