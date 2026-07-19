import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';

import { EmailService } from '@/modules/email/email.service';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';

@Injectable()
export class RegistrationEmailResendingUseCase implements IUseCase<string, void> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userQueryRepository.findUserByEmail(email);
    if (!user) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'email not registered', field: 'email' },
      ]);
    }
    if (user.isConfirmed) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'email already confirmed', field: 'email' },
      ]);
    }
    const newConfirmationCode = randomUUID();
    await this.userRepository.updateUserConfirmationCode({
      userId: user.id,
      newCode: newConfirmationCode,
    });
    await this.emailService.sendEmailWithNewConfirmationCode(
      user.email,
      user.login,
      newConfirmationCode,
    );
  }
}
