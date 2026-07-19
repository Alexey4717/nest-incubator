import { Injectable } from '@nestjs/common';

import { resultToDomainException } from '@/core/result/result-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { EmailService } from '@/modules/email/email.service';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user.use-case';

type RegistrationInput = {
  login: string;
  email: string;
  password: string;
};

@Injectable()
export class RegistrationUseCase implements IUseCase<RegistrationInput, void> {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: RegistrationInput): Promise<void> {
    const user = resultToDomainException(await this.registerUserUseCase.execute(input));
    await this.emailService.sendRegistrationEmail(
      user.email,
      user.login,
      user.confirmationCode ?? '',
    );
  }
}
