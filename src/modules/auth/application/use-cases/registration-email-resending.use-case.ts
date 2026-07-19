import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';

import { EmailService } from '@/modules/email/email.service';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { modelToDb } from '@/modules/user/infrastructure/user.mapper';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';

@Injectable()
export class RegistrationEmailResendingUseCase implements IUseCase<string, void> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const found = await this.userQueryRepository.findUserByEmail(email);
    if (!found) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'email not registered', field: 'email' },
      ]);
    }

    const user = UserEntity.reconstitute(modelToDb(found));
    user.assertNotConfirmed();

    const newConfirmationCode = randomUUID();
    user.updateConfirmationCode(newConfirmationCode);
    await this.userRepository.save(user);

    const data = user.toDb();
    await this.emailService.sendEmailWithNewConfirmationCode(
      data.email,
      data.login,
      newConfirmationCode,
    );
  }
}
