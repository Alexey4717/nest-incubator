import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthConfig } from '../auth.config';
import { IAuthenticatedUserId } from '../models/authenticated-user.model';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(authConfig: AuthConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.ACCESS_TOKEN_SECRET,
      ignoreExpiration: false,
    });
  }

  validate(payload: { userId: string; deviceId: string }): IAuthenticatedUserId {
    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
