import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';

import { CheckCredentialsUseCase } from '@/modules/user/application/use-cases/check-credentials.use-case';

import { IAuthenticatedUser } from '../models/authenticated-user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly checkCredentialsUseCase: CheckCredentialsUseCase) {
    super({ usernameField: 'loginOrEmail', passwordField: 'password' });
  }

  async validate(loginOrEmail: string, password: string): Promise<IAuthenticatedUser> {
    const user = await this.checkCredentialsUseCase.execute({
      loginOrEmail,
      password,
    });
    if (!user) {
      throw new DomainException(DomainExceptionCode.Unauthorized);
    }
    return { userId: user.id };
  }
}
