import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { IUseCase } from '@/shared/types/use-case';

import { EmailService } from '@/modules/email/email.service';
import { UserQueryRepository } from '@/modules/user/infrastructure/user-query.repository';
import { UserRepository } from '@/modules/user/infrastructure/user.repository';

@Injectable()
export class PasswordRecoveryUseCase implements IUseCase<string, void | null> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void | null> {
    const user = await this.userQueryRepository.findUserByEmail(email);
    if (!user) return null;
    const recoveryCode = randomUUID();
    await this.userRepository.setUserRecoveryData({
      userId: user.id,
      recoveryCode,
      recoveryExpiration: add(new Date(), { hours: 1 }),
    });
    return this.emailService.sendPasswordRecoveryCode(user.email, user.login, recoveryCode);
  }
}
