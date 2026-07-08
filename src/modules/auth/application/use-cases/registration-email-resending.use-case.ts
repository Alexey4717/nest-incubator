import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { IUseCase } from '@/shared/types/use-case';
import { createBadRequestErrors } from '@/shared/utils/bad-request-errors';

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
      throw new BadRequestException(
        createBadRequestErrors({ message: 'email not registered', field: 'email' }),
      );
    }
    if (user.isConfirmed) {
      throw new BadRequestException(
        createBadRequestErrors({ message: 'email already confirmed', field: 'email' }),
      );
    }
    const newConfirmationCode = randomUUID();
    await this.userRepository.updateUserConfirmationCode({
      userId: user.id,
      newCode: newConfirmationCode,
    });
    void this.emailService
      .sendEmailWithNewConfirmationCode(user.email, user.login, newConfirmationCode)
      .catch((error) => {
        console.log(`RegistrationEmailResendingUseCase.sendEmail error: ${error}`);
      });
  }
}
