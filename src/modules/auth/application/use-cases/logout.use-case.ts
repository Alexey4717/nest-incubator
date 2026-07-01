import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionRepository } from '@/modules/session/infrastructure/session.repository.mongodb';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

type LogoutInput = {
  userId: string;
  refreshTokenJWTPayload: IRefreshTokenJwtPayload;
};

@Injectable()
export class LogoutUseCase implements IUseCase<LogoutInput, boolean> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({ userId, refreshTokenJWTPayload }: LogoutInput): Promise<boolean> {
    const lastActiveDate = new Date(refreshTokenJWTPayload.iat * 1000).toISOString();
    const deleted = await this.sessionRepository.deleteOneSessionByUserAndDeviceIdAndDate(
      userId,
      refreshTokenJWTPayload.deviceId,
      lastActiveDate,
    );
    return Boolean(deleted);
  }
}
