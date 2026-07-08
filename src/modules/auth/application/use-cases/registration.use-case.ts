import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

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
    const user = await this.registerUserUseCase.execute(input);
    void this.emailService
      .sendRegistrationEmail(user.email, user.login, user.confirmationCode ?? '')
      .catch((error) => {
        console.log(`RegistrationUseCase.sendRegistrationEmail error: ${error}`);
      });
  }
}
