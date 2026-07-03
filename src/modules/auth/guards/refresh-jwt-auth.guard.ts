import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IAuthenticatedUserId } from '../models/authenticated-user.model';
import { RefreshJwtValidateResult } from '../strategies/refresh-jwt.strategy';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = IAuthenticatedUserId>(
    err: Error | null,
    result: RefreshJwtValidateResult | false | null,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !result) {
      throw err || new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    request.user = { userId: result.userId, deviceId: result.payload.deviceId } satisfies IAuthenticatedUserId;
    request.userId = result.userId;
    request.deviceId = result.payload.deviceId;
    request.refreshTokenJWTPayload = result.payload;
    return request.user as TUser;
  }
}
