import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { IAuthenticatedUser } from '../models/authenticated-user.model';

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser = IAuthenticatedUser>(
    err: Error | null,
    user: IAuthenticatedUser | false | null,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new DomainException(DomainExceptionCode.Unauthorized);
    }

    return user as TUser;
  }
}
