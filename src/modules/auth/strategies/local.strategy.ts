import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { CheckCredentialsQuery } from '@/modules/user/application/queries/check-credentials.query';

import { IAuthenticatedUser } from '../models/authenticated-user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly queryBus: QueryBus) {
    super({ usernameField: 'loginOrEmail', passwordField: 'password' });
  }

  async validate(loginOrEmail: string, password: string): Promise<IAuthenticatedUser> {
    const user = await this.queryBus.execute(
      new CheckCredentialsQuery({
        loginOrEmail,
        password,
      }),
    );
    if (!user) {
      throw new DomainException(DomainExceptionCode.Unauthorized);
    }
    return { userId: user.id };
  }
}
