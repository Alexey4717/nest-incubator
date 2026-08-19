import { Injectable } from '@nestjs/common';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { ConfirmEmailUseCase } from '@/modules/user/application/use-cases/confirm-email.use-case';

@Injectable()
export class RegistrationConfirmationUseCase implements IUseCase<string, void> {
  constructor(private readonly confirmEmailUseCase: ConfirmEmailUseCase) {}

  async execute(code: string): Promise<void> {
    notificationToDomainException(await this.confirmEmailUseCase.execute(code));
  }
}
