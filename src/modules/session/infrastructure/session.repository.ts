import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Not, Repository } from 'typeorm';

import { runWithTransactionRetry } from '@/core/typeorm/run-with-transaction-retry';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';

import { SessionEntity } from '../domain/entities/session.entity';
import { SessionOrmEntity } from './session.orm-entity';
import { SessionPersistenceMapper } from './session.persistence-mapper';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly sessionsRepository: Repository<SessionOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly internalIdResolver: InternalIdResolver,
  ) {}

  async createNewSession(newSession: SessionEntity): Promise<SessionEntity> {
    const userInternalId = await this.internalIdResolver.resolveUserId(newSession.userId);
    const entity = SessionPersistenceMapper.toPersistence(newSession, userInternalId);
    const saved = await this.sessionsRepository.save(entity);
    return SessionPersistenceMapper.toDomain(saved, newSession.userId);
  }

  async findByDeviceId(deviceId: string): Promise<SessionEntity | null> {
    const entity = await this.sessionsRepository.findOne({ where: { deviceId } });
    if (!entity) return null;
    const userPublicId = await this.internalIdResolver.lookupUserPublicId(entity.userId);
    if (!userPublicId) return null;
    return SessionPersistenceMapper.toDomain(entity, userPublicId);
  }

  async findByUserAndDevice(userId: string, deviceId: string): Promise<SessionEntity | null> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userId);
    const entity = await this.sessionsRepository.findOne({
      where: { userId: userInternalId, deviceId },
    });
    if (!entity) return null;
    return SessionPersistenceMapper.toDomain(entity, userId);
  }

  async rotateRefreshToken(
    userId: string,
    deviceId: string,
    expectedJti: string,
    session: SessionEntity,
  ): Promise<boolean> {
    const data = session.toDb();

    return runWithTransactionRetry(() =>
      this.dataSource.transaction(async (manager) => {
        const userInternalId = await this.internalIdResolver.resolveUserId(userId, manager);
        const sessionsRepository = manager.getRepository(SessionOrmEntity);

        const sessionEntity = await sessionsRepository
          .createQueryBuilder('session')
          .setLock('pessimistic_write')
          .where('session.deviceId = :deviceId', { deviceId })
          .andWhere('session.userId = :userId', { userId: userInternalId })
          .getOne();

        if (!sessionEntity) return false;
        if (sessionEntity.currentRefreshTokenJti !== expectedJti) return false;

        sessionEntity.currentRefreshTokenJti = data.currentRefreshTokenJti;
        sessionEntity.lastActiveDate = data.lastActiveDate;
        await sessionsRepository.save(sessionEntity);
        return true;
      }),
    );
  }

  async deleteOneSessionByUserAndDeviceId(userId: string, deviceId: string): Promise<boolean> {
    try {
      const userInternalId = await this.internalIdResolver.resolveUserId(userId);
      const result = await this.sessionsRepository.delete({ userId: userInternalId, deviceId });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(
        `sessionsRepository.deleteOneSessionByUserAndDeviceId error is occurred: ${error}`,
      );
      return false;
    }
  }

  async deleteAllSessionExceptCurrent(userId: string, deviceId: string) {
    const userInternalId = await this.internalIdResolver.resolveUserId(userId);
    return this.sessionsRepository.delete({
      userId: userInternalId,
      deviceId: Not(deviceId),
    });
  }

  async deleteAllExpiredSessions(expiresISOString: string) {
    return this.sessionsRepository.delete({
      lastActiveDate: LessThan(new Date(expiresISOString)),
    });
  }

  async deleteAllUserSession(userId: string) {
    const userInternalId = await this.internalIdResolver.resolveUserId(userId);
    return this.sessionsRepository.delete({ userId: userInternalId });
  }
}
