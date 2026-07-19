import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { ConfirmEmailUseCase } from '@/modules/user/application/use-cases/confirm-email.use-case';

@Injectable()
export class RegistrationConfirmationUseCase implements IUseCase<string, void> {
  constructor(private readonly confirmEmailUseCase: ConfirmEmailUseCase) {}

  execute(code: string): Promise<void> {
    return this.confirmEmailUseCase.execute(code);
  }
}
