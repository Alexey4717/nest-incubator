import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { IRefreshTokenJwtPayload } from '../models/refresh-token-jwt-payload.model';

export type RefreshJwtValidateResult = {
  userId: string;
  payload: IRefreshTokenJwtPayload;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.refreshToken ?? null,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  validate(payload: IRefreshTokenJwtPayload): RefreshJwtValidateResult {
    return { userId: payload.userId, payload };
  }
}
