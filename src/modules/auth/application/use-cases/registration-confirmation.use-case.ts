import { Injectable } from '@nestjs/common';

import { resultToDomainException } from '@/core/result/result-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { ConfirmEmailUseCase } from '@/modules/user/application/use-cases/confirm-email.use-case';

@Injectable()
export class RegistrationConfirmationUseCase implements IUseCase<string, void> {
  constructor(private readonly confirmEmailUseCase: ConfirmEmailUseCase) {}

  async execute(code: string): Promise<void> {
    resultToDomainException(await this.confirmEmailUseCase.execute(code));
  }
}
