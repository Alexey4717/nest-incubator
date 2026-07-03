import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

import { AuthConfig } from '../../auth.config';
import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly authConfig: AuthConfig,
  ) {}

  signAccessAndRefreshToken(userId: string, deviceId: string) {
    const accessToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.authConfig.ACCESS_TOKEN_SECRET,
        expiresIn: this.authConfig.ACCESS_TOKEN_LIFE_TIME,
      },
    );
    const refreshToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.authConfig.REFRESH_TOKEN_SECRET,
        expiresIn: this.authConfig.REFRESH_TOKEN_LIFE_TIME,
      },
    );
    return { accessToken, refreshToken };
  }

  getIssuedAtFromRefreshToken(token: string): string {
    const payload = this.nestJwtService.decode(token) as { iat: number } | null;
    return new Date(payload!.iat * 1000).toISOString();
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
