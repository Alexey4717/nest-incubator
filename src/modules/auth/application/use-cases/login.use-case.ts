import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { IUseCase } from '@/shared/types/use-case';

import { SessionService } from '@/modules/session/application/session.service';
import { Session } from '@/modules/session/models/session.schema';

import { AuthTokensViewModel } from '../../types/view-models';
import { JwtTokenService } from '../services/jwt-token.service';

type LoginInput = {
  userId: string;
  ip: string;
  userAgent: string;
};

@Injectable()
export class LoginUseCase implements IUseCase<LoginInput, AuthTokensViewModel> {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
  ) {}

  async execute({ userId, ip, userAgent }: LoginInput): Promise<AuthTokensViewModel> {
    const deviceId = randomUUID();
    const { accessToken, refreshToken } = this.jwtTokenService.signAccessAndRefreshToken(
      userId,
      deviceId,
    );
    const lastActiveDate = this.jwtTokenService.getIssuedAtFromRefreshToken(refreshToken);
    const sessionInfo: Session = {
      ip,
      title: userAgent,
      lastActiveDate,
      deviceId,
      userId,
    };
    await this.sessionService.createNewSession(sessionInfo);
    return { accessToken, refreshToken };
  }
}
