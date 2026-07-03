import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IRefreshTokenJwtPayload } from '@/modules/auth/models/refresh-token-jwt-payload.model';

import { SessionQueryRepository } from '../infrastructure/session-query.repository.mongodb';
import { SessionRepository } from '../infrastructure/session.repository.mongodb';
import { Session } from '../models/session.schema';
import { SessionConfig } from '../session.config';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionConfig: SessionConfig,
    private readonly sessionRepository: SessionRepository,
    private readonly sessionQueryRepository: SessionQueryRepository,
  ) {}

  async createNewSession(newSession: Session) {
    return this.sessionRepository.createNewSession(newSession);
  }

  async deleteOneSessionByUserAndDeviceId(userId: string, deviceId: string) {
    const session = await this.sessionQueryRepository.findOneByDeviceId(deviceId);
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();
    return this.sessionRepository.deleteOneSessionByUserAndDeviceId(userId, deviceId);
  }

  async deleteAllUserSessionExceptCurrent(refreshTokenJwtPayloadDto: IRefreshTokenJwtPayload) {
    return this.sessionRepository.deleteAllSessionExceptCurrent(
      refreshTokenJwtPayloadDto.userId,
      refreshTokenJwtPayloadDto.deviceId,
    );
  }

  async updateSessionAfterRefreshToken(
    userId: string,
    deviceId: string,
    newLastActiveDate: string,
  ) {
    return this.sessionRepository.updateSessionAfterRefreshToken(
      userId,
      deviceId,
      newLastActiveDate,
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async deleteAllExpiredSessions() {
    const refreshTokenLifeTime = this.sessionConfig.REFRESH_TOKEN_LIFE_TIME;
    const expiredISOStringValueFromNow = new Date(
      +new Date() - refreshTokenLifeTime * 1000,
    ).toISOString();
    return this.sessionRepository.deleteAllExpiredSessions(expiredISOStringValueFromNow);
  }
}
