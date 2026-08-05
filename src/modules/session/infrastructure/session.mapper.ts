import { SessionDb, SessionEntity } from '../domain/entities/session.entity';
import { SessionViewModel } from '../models/session-view.model';
import { SessionModel } from '../models/session.model';
import { SessionOrmEntity } from './session.orm-entity';

export function toDomain(entity: SessionOrmEntity, userPublicId: string): SessionModel {
  return {
    userId: userPublicId,
    deviceId: entity.deviceId,
    ip: entity.ip,
    title: entity.title,
    lastActiveDate: entity.lastActiveDate.toISOString(),
    currentRefreshTokenJti: entity.currentRefreshTokenJti,
  };
}

export function toOrm(model: SessionModel): SessionOrmEntity {
  const entity = new SessionOrmEntity();
  entity.deviceId = model.deviceId;
  entity.userId = model.userId;
  entity.ip = model.ip;
  entity.title = model.title;
  entity.lastActiveDate = new Date(model.lastActiveDate);
  entity.currentRefreshTokenJti = model.currentRefreshTokenJti;
  return entity;
}

export function modelToDb(model: SessionModel): SessionDb {
  return {
    userId: model.userId,
    deviceId: model.deviceId,
    ip: model.ip,
    title: model.title,
    lastActiveDate: new Date(model.lastActiveDate),
    currentRefreshTokenJti: model.currentRefreshTokenJti,
  };
}

export function fromEntity(entity: SessionEntity): SessionModel {
  const data = entity.toDb();
  return {
    userId: data.userId,
    deviceId: data.deviceId,
    ip: data.ip,
    title: data.title,
    lastActiveDate: data.lastActiveDate.toISOString(),
    currentRefreshTokenJti: data.currentRefreshTokenJti,
  };
}

export function toSessionViewModel(model: SessionModel): SessionViewModel {
  return {
    ip: model.ip,
    title: model.title,
    lastActiveDate: model.lastActiveDate,
    deviceId: model.deviceId,
  };
}
