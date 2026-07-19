import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { resultToDomainException } from '@/core/result/result-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { CreateSessionUseCase } from '@/modules/session/application/use-cases/create-session.use-case';
import { SessionModel } from '@/modules/session/models/session.model';

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
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute({ userId, ip, userAgent }: LoginInput): Promise<AuthTokensViewModel> {
    const deviceId = randomUUID();
    const { accessToken, refreshToken, jti, lastActiveDate } =
      this.jwtTokenService.signAccessAndRefreshToken(userId, deviceId);
    const sessionInfo: SessionModel = {
      ip,
      title: userAgent,
      lastActiveDate,
      currentRefreshTokenJti: jti,
      deviceId,
      userId,
    };
    resultToDomainException(await this.createSessionUseCase.execute(sessionInfo));
    return { accessToken, refreshToken };
  }
}
