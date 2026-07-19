import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { AuthConfig } from '../../auth.config';
import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly authConfig: AuthConfig,
  ) {}

  signAccessAndRefreshToken(userId: string, deviceId: string) {
    const jti = randomUUID();
    const lastActiveDate = new Date().toISOString();
    const accessToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.authConfig.ACCESS_TOKEN_SECRET,
        expiresIn: this.authConfig.ACCESS_TOKEN_LIFE_TIME,
      },
    );
    const refreshToken = this.nestJwtService.sign(
      { userId, deviceId, jti },
      {
        secret: this.authConfig.REFRESH_TOKEN_SECRET,
        expiresIn: this.authConfig.REFRESH_TOKEN_LIFE_TIME,
      },
    );
    return { accessToken, refreshToken, jti, lastActiveDate };
  }

  verifyRefreshToken(token: string): IRefreshTokenJwtPayload | null {
    try {
      return this.nestJwtService.verify(token, {
        secret: this.authConfig.REFRESH_TOKEN_SECRET,
      }) as IRefreshTokenJwtPayload;
    } catch {
      return null;
    }
  }
}
