import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionViewModel } from '../models/session-view.model';
import { SessionModel } from '../models/session.model';
import { toDomain, toSessionViewModel } from './session.mapper';
import { SessionOrmEntity } from './session.orm-entity';

@Injectable()
export class SessionQueryRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly sessionsRepository: Repository<SessionOrmEntity>,
  ) {}

  async findOneByDeviceAndUserIdAndDate(
    deviceId: string,
    userId: string,
    lastActiveDate: string,
  ): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({
      where: {
        deviceId,
        userId,
        lastActiveDate: new Date(lastActiveDate),
      },
    });
    return entity ? toDomain(entity) : null;
  }

  async findOneByDeviceIdAndDate(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({
      where: {
        deviceId,
        lastActiveDate: new Date(lastActiveDate),
      },
    });
    return entity ? toDomain(entity) : null;
  }

  async findOneByDeviceId(deviceId: string): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({ where: { deviceId } });
    return entity ? toDomain(entity) : null;
  }

  async findOneByDeviceAndUserId(deviceId: string, userId: string): Promise<SessionModel | null> {
    const entity = await this.sessionsRepository.findOne({ where: { deviceId, userId } });
    return entity ? toDomain(entity) : null;
  }

  async findAllDevicesByUserId(userId: string): Promise<SessionViewModel[]> {
    const entities = await this.sessionsRepository.find({
      where: { userId },
      select: {
        ip: true,
        title: true,
        lastActiveDate: true,
        deviceId: true,
        userId: true,
      },
    });
    return entities.map((entity) => toSessionViewModel(toDomain(entity)));
  }
}
