import { Injectable } from '@nestjs/common';

import { resultToDomainException } from '@/core/result/result-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user.use-case';

type RegistrationInput = {
  login: string;
  email: string;
  password: string;
};

@Injectable()
export class RegistrationUseCase implements IUseCase<RegistrationInput, void> {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async execute(input: RegistrationInput): Promise<void> {
    resultToDomainException(await this.registerUserUseCase.execute(input));
  }
}
