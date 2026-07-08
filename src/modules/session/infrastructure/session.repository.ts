import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';

import { SessionModel } from '../models/session.model';
import { SessionEntity } from './session.entity';
import { toDomain, toOrm } from './session.mapper';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
  ) {}

  async createNewSession(newSessionInfo: SessionModel): Promise<SessionModel> {
    const entity = toOrm(newSessionInfo);
    const saved = await this.sessionsRepository.save(entity);
    return toDomain(saved);
  }

  async updateSessionAfterRefreshToken(
    userId: string,
    deviceId: string,
    newLastActiveDate: string,
  ) {
    return this.sessionsRepository.update(
      { userId, deviceId },
      { lastActiveDate: new Date(newLastActiveDate) },
    );
  }

  async deleteOneSessionByUserAndDeviceIdAndDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({
      where: {
        userId,
        deviceId,
        lastActiveDate: new Date(lastActiveDate),
      },
    });
    if (!entity) return null;

    await this.sessionsRepository.delete({
      userId,
      deviceId,
      lastActiveDate: entity.lastActiveDate,
    });
    return toDomain(entity);
  }

  async deleteOneSessionByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({
      where: { userId, deviceId },
    });
    if (!entity) return null;

    await this.sessionsRepository.delete({ deviceId });
    return toDomain(entity);
  }

  async deleteAllSessionExceptCurrent(userId: string, deviceId: string) {
    return this.sessionsRepository.delete({
      userId,
      deviceId: Not(deviceId),
    });
  }

  async deleteAllExpiredSessions(expiresISOString: string) {
    return this.sessionsRepository.delete({
      lastActiveDate: LessThan(new Date(expiresISOString)),
    });
  }

  async deleteAllUserSession(userId: string) {
    return this.sessionsRepository.delete({ userId });
  }
}
