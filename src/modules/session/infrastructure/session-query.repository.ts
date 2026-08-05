import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';

import { SessionViewModel } from '../models/session-view.model';
import { SessionModel } from '../models/session.model';
import { toDomain, toSessionViewModel } from './session.mapper';
import { SessionOrmEntity } from './session.orm-entity';

@Injectable()
export class SessionQueryRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly sessionsRepository: Repository<SessionOrmEntity>,
    private readonly internalIdResolver: InternalIdResolver,
  ) {}

  async findOneByDeviceId(deviceId: string): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({ where: { deviceId } });
    if (!entity) return null;
    const userPublicId = await this.internalIdResolver.lookupUserPublicId(entity.userId);
    if (!userPublicId) return null;
    return toDomain(entity, userPublicId);
  }

  async findOneByDeviceAndUserId(deviceId: string, userId: string): Promise<SessionModel | null> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userId);
    const entity = await this.sessionsRepository.findOne({
      where: { deviceId, userId: userInternalId },
    });
    if (!entity) return null;
    return toDomain(entity, userId);
  }

  async findAllDevicesByUserId(userId: string): Promise<SessionViewModel[]> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userId);
    const entities = await this.sessionsRepository.find({
      where: { userId: userInternalId },
      select: {
        ip: true,
        title: true,
        lastActiveDate: true,
        deviceId: true,
        userId: true,
      },
    });
    return entities.map((entity) => toSessionViewModel(toDomain(entity, userId)));
  }
}
