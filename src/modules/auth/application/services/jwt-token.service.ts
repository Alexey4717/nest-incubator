import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

@Injectable()
export class JwtTokenService {
  private readonly accessTokenSecretKey: string;
  private readonly accessTokenLifeTimeSec: string | number;
  private readonly refreshTokenSecretKey: string;
  private readonly refreshTokenLifeTimeSec: string | number;

  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecretKey = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecretKey = this.configService.get<string>('REFRESH_TOKEN_SECRET');

    this.accessTokenLifeTimeSec =
      this.configService.get<string>('ACCESS_TOKEN_LIFE_TIME') ??
      process.env.ACCESS_TOKEN_LIFE_TIME ??
      300;

    this.refreshTokenLifeTimeSec =
      this.configService.get<string>('REFRESH_TOKEN_LIFE_TIME') ??
      process.env.REFRESH_TOKEN_LIFE_TIME ??
      20 * 60 * 60;
  }

  signAccessAndRefreshToken(userId: string, deviceId: string) {
    const accessToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.accessTokenSecretKey,
        expiresIn: this.accessTokenLifeTimeSec,
      },
    );
    const refreshToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.refreshTokenSecretKey,
        expiresIn: this.refreshTokenLifeTimeSec,
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
        secret: this.refreshTokenSecretKey,
      }) as IRefreshTokenJwtPayload;
    } catch {
      return null;
    }
  }
}
