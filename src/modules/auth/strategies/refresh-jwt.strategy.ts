import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { AuthConfig } from '../auth.config';
import { IRefreshTokenJwtPayload } from '../models/refresh-token-jwt-payload.model';

export type RefreshJwtValidateResult = {
  userId: string;
  payload: IRefreshTokenJwtPayload;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(authConfig: AuthConfig) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.refreshToken ?? null,
      secretOrKey: authConfig.REFRESH_TOKEN_SECRET,
      ignoreExpiration: false,
    });
  }

  validate(payload: IRefreshTokenJwtPayload): RefreshJwtValidateResult {
    return { userId: payload.userId, payload };
  }
}
