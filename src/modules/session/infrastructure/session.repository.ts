import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';

import { SessionEntity } from '../domain/entities/session.entity';
import { SessionPersistenceMapper } from '../domain/mappers/session.persistence-mapper';
import { SessionOrmEntity } from './session.orm-entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly sessionsRepository: Repository<SessionOrmEntity>,
  ) {}

  async createNewSession(newSession: SessionEntity): Promise<SessionEntity> {
    const entity = SessionPersistenceMapper.toPersistence(newSession);
    const saved = await this.sessionsRepository.save(entity);
    return SessionPersistenceMapper.toDomain(saved);
  }

  async findByDeviceId(deviceId: string): Promise<SessionEntity | null> {
    const entity = await this.sessionsRepository.findOne({ where: { deviceId } });
    return entity ? SessionPersistenceMapper.toDomain(entity) : null;
  }

  async findByUserAndDevice(userId: string, deviceId: string): Promise<SessionEntity | null> {
    const entity = await this.sessionsRepository.findOne({ where: { userId, deviceId } });
    return entity ? SessionPersistenceMapper.toDomain(entity) : null;
  }

  async save(session: SessionEntity): Promise<boolean> {
    const data = session.toDb();
    const result = await this.sessionsRepository.update(
      { deviceId: data.deviceId },
      { lastActiveDate: data.lastActiveDate },
    );
    return (result.affected ?? 0) === 1;
  }

  async deleteOneSessionByUserAndDeviceIdAndDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    try {
      const result = await this.sessionsRepository.delete({
        userId,
        deviceId,
        lastActiveDate: new Date(lastActiveDate),
      });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(
        `sessionsRepository.deleteOneSessionByUserAndDeviceIdAndDate error is occurred: ${error}`,
      );
      return false;
    }
  }

  async deleteOneSessionByUserAndDeviceId(userId: string, deviceId: string): Promise<boolean> {
    try {
      const result = await this.sessionsRepository.delete({ deviceId });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(
        `sessionsRepository.deleteOneSessionByUserAndDeviceId error is occurred: ${error}`,
      );
      return false;
    }
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
