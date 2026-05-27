import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

/** Минимальное время жизни access token — 5 минут (ТЗ homework). */
const MIN_ACCESS_TOKEN_TTL_SEC = 300;

@Injectable()
export class JwtService {
  private readonly accessTokenSecretKey: string;
  private readonly accessTokenLifeTimeSec: number;
  private readonly refreshTokenSecretKey: string;
  private readonly refreshTokenLifeTimeSec: number;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecretKey = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    this.refreshTokenSecretKey = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    const accessParsed = parseInt(
      this.configService.get<string>('ACCESS_TOKEN_LIFE_TIME'),
      10,
    );
    this.accessTokenLifeTimeSec =
      Number.isFinite(accessParsed)
        ? Math.max(MIN_ACCESS_TOKEN_TTL_SEC, accessParsed)
        : MIN_ACCESS_TOKEN_TTL_SEC;

    const refreshParsed = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_LIFE_TIME'),
      10,
    );
    this.refreshTokenLifeTimeSec =
      Number.isFinite(refreshParsed) && refreshParsed > 0
        ? refreshParsed
        : 20 * 60 * 60;
  }

  async signAccessToken(userId: string, deviceId: string): Promise<string> {
    return jwt.sign({ userId, deviceId }, this.accessTokenSecretKey, {
      expiresIn: this.accessTokenLifeTimeSec,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<any> {
    try {
      return jwt.verify(accessToken, this.accessTokenSecretKey);
    } catch (e) {
      return null;
    }
  }

  getPayloadFromAccessToken(accessToken: string): any {
    return jwt.decode(accessToken);
  }

  verifyRefreshToken(refreshToken: string): any {
    try {
      return jwt.verify(refreshToken, this.refreshTokenSecretKey);
    } catch (e) {
      return null;
    }
  }

  async signAccessAndRefreshToken(userId: string, deviceId: string) {
    const accessToken = jwt.sign(
      { userId, deviceId },
      this.accessTokenSecretKey,
      {
        expiresIn: this.accessTokenLifeTimeSec,
      },
    );
    const refreshToken = jwt.sign(
      { userId, deviceId },
      this.refreshTokenSecretKey,
      {
        expiresIn: this.refreshTokenLifeTimeSec,
      },
    );
    return { accessToken, refreshToken };
  }

  async getIssuedAtFromRefreshToken(token: string): Promise<string> {
    const payload: any = await jwt.decode(token);
    return new Date(payload.iat * 1000).toISOString();
  }
}
