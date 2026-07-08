import { SessionViewModel } from '../models/session-view.model';
import { SessionModel } from '../models/session.model';
import { SessionEntity } from './session.entity';

export function toDomain(entity: SessionEntity): SessionModel {
  return {
    userId: entity.userId,
    deviceId: entity.deviceId,
    ip: entity.ip,
    title: entity.title,
    lastActiveDate: entity.lastActiveDate.toISOString(),
  };
}

export function toOrm(model: SessionModel): SessionEntity {
  const entity = new SessionEntity();
  entity.deviceId = model.deviceId;
  entity.userId = model.userId;
  entity.ip = model.ip;
  entity.title = model.title;
  entity.lastActiveDate = new Date(model.lastActiveDate);
  return entity;
}

export function toSessionViewModel(model: SessionModel): SessionViewModel {
  return {
    ip: model.ip,
    title: model.title,
    lastActiveDate: model.lastActiveDate,
    deviceId: model.deviceId,
  };
}
