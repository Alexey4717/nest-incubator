import { Injectable } from '@nestjs/common';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { ChangePasswordUseCase } from '@/modules/user/application/use-cases/change-password.use-case';

type NewPasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class NewPasswordUseCase implements IUseCase<NewPasswordInput, void> {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  async execute(input: NewPasswordInput): Promise<void> {
    notificationToDomainException(await this.changePasswordUseCase.execute(input));
  }
}
