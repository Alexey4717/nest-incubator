import { SessionOrmEntity } from '../../infrastructure/session.orm-entity';
import { SessionEntity } from '../entities/session.entity';

export const SessionPersistenceMapper = {
  toDomain(raw: SessionOrmEntity, userPublicId: string): SessionEntity {
    return SessionEntity.reconstitute({
      deviceId: raw.deviceId,
      userId: userPublicId,
      ip: raw.ip,
      title: raw.title,
      lastActiveDate: raw.lastActiveDate,
      currentRefreshTokenJti: raw.currentRefreshTokenJti,
    });
  },

  toPersistence(entity: SessionEntity, userInternalId: string): SessionOrmEntity {
    const data = entity.toDb();
    const orm = new SessionOrmEntity();
    orm.deviceId = data.deviceId;
    orm.userId = userInternalId;
    orm.ip = data.ip;
    orm.title = data.title;
    orm.lastActiveDate = data.lastActiveDate;
    orm.currentRefreshTokenJti = data.currentRefreshTokenJti;
    return orm;
  },
};
