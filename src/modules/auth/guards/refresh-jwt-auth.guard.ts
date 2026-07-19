import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';

import { IAuthenticatedUser } from '../models/authenticated-user.model';
import { RefreshJwtValidateResult } from '../strategies/refresh-jwt.strategy';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = IAuthenticatedUser>(
    err: Error | null,
    result: RefreshJwtValidateResult | false | null,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !result) {
      throw err || new DomainException(DomainExceptionCode.Unauthorized);
    }

    const request = context.switchToHttp().getRequest();
    request.user = {
      userId: result.userId,
      deviceId: result.payload.deviceId,
    } satisfies IAuthenticatedUser;
    request.refreshTokenJWTPayload = result.payload;
    return request.user as TUser;
  }
}
