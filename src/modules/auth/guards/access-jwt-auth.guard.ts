import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IAuthenticatedUser } from '../models/authenticated-user.model';

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser = IAuthenticatedUser>(
    err: Error | null,
    user: IAuthenticatedUser | false | null,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user as TUser;
  }
}
