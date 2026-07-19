import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository';
import { SessionRepository } from '@/modules/session/infrastructure/session.repository';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

type LogoutInput = {
  userId: string;
  refreshTokenJWTPayload: IRefreshTokenJwtPayload;
};

@Injectable()
export class LogoutUseCase implements IUseCase<LogoutInput, boolean> {
  constructor(
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute({ userId, refreshTokenJWTPayload }: LogoutInput): Promise<boolean> {
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserId(
      refreshTokenJWTPayload.deviceId,
      userId,
    );
    if (!found || found.currentRefreshTokenJti !== refreshTokenJWTPayload.jti) return false;

    return this.sessionRepository.deleteOneSessionByUserAndDeviceId(
      userId,
      refreshTokenJWTPayload.deviceId,
    );
  }
}
