import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { CheckCredentialsUseCase } from '@/modules/user/application/use-cases/check-credentials.use-case';

import { IAuthenticatedUserId } from '../models/authenticated-user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly checkCredentialsUseCase: CheckCredentialsUseCase) {
    super({ usernameField: 'loginOrEmail', passwordField: 'password' });
  }

  async validate(loginOrEmail: string, password: string): Promise<IAuthenticatedUserId> {
    const user = await this.checkCredentialsUseCase.execute({
      loginOrEmail,
      password,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id };
  }
}
