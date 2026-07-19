import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { ChangePasswordUseCase } from '@/modules/user/application/use-cases/change-password.use-case';

type NewPasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class NewPasswordUseCase implements IUseCase<NewPasswordInput, boolean> {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  execute(input: NewPasswordInput): Promise<boolean> {
    return this.changePasswordUseCase.execute(input);
  }
}
