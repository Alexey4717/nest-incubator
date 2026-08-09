import { UserEntity } from '../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';

export const UserPersistenceMapper = {
  toDomain(raw: UserOrmEntity): UserEntity {
    return UserEntity.reconstitute({
      id: raw.publicId,
      login: raw.login,
      email: raw.email,
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
      confirmationCode: raw.confirmationCode,
      confirmationExpiration: raw.confirmationExpiration,
      isConfirmed: raw.isConfirmed,
      recoveryCode: raw.recoveryCode,
      recoveryExpiration: raw.recoveryExpiration,
    });
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
