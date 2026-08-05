import { UserOrmEntity } from '../../infrastructure/user.orm-entity';
import { UserEntity } from '../entities/user.entity';

export const UserPersistenceMapper = {
  toDomain(raw: UserOrmEntity): UserEntity {
    return UserEntity.reconstitute(raw);
  },

  toPersistence(entity: UserEntity): UserOrmEntity {
    const data = entity.toDb();
    const orm = new UserOrmEntity();
    orm.publicId = data.id;
    orm.login = data.login;
    orm.email = data.email;
    orm.passwordHash = data.passwordHash;
    orm.createdAt = data.createdAt;
    orm.confirmationCode = data.confirmationCode;
    orm.confirmationExpiration = data.confirmationExpiration;
    orm.isConfirmed = data.isConfirmed;
    orm.recoveryCode = data.recoveryCode;
    orm.recoveryExpiration = data.recoveryExpiration;
    return orm;
  },
};
