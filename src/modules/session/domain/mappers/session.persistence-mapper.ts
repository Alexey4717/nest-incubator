import { SessionOrmEntity } from '../../infrastructure/session.orm-entity';
import { SessionEntity } from '../entities/session.entity';

export const SessionPersistenceMapper = {
  toDomain(raw: SessionOrmEntity): SessionEntity {
    return SessionEntity.reconstitute(raw);
  },

  toPersistence(entity: SessionEntity): SessionOrmEntity {
    const data = entity.toDb();
    const orm = new SessionOrmEntity();
    orm.deviceId = data.deviceId;
    orm.userId = data.userId;
    orm.ip = data.ip;
    orm.title = data.title;
    orm.lastActiveDate = data.lastActiveDate;
    return orm;
  },
};
