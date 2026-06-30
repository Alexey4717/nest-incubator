import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IRefreshTokenJwtPayload } from '../models/refresh-token-jwt-payload.model';

export const RefreshTokenJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRefreshTokenJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.refreshTokenJWTPayload;
  },
);
