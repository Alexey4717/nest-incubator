import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IAuthenticatedUserId } from '../models/authenticated-user.model';

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser = IAuthenticatedUserId>(
    err: Error | null,
    user: IAuthenticatedUserId | false | null,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    request.user = user;
    request.userId = user.userId;

    return user as TUser;
  }
}
