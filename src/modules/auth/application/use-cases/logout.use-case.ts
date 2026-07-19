import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

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
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserIdAndDate(
      refreshTokenJWTPayload.deviceId,
      userId,
      refreshTokenJWTPayload.lastActiveDate,
    );
    if (!found) return false;

    return this.sessionRepository.deleteOneSessionByUserAndDeviceIdAndDate(
      userId,
      refreshTokenJWTPayload.deviceId,
      refreshTokenJWTPayload.lastActiveDate,
    );
  }
}
