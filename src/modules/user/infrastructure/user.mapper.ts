import { UserDb, UserEntity } from '../domain/entities/user.entity';
import { UserModel } from '../models/user.model';
import { UserOrmEntity } from './user.orm-entity';

export function toDomain(entity: UserOrmEntity): UserModel {
  return {
    id: entity.id,
    login: entity.login,
    email: entity.email,
    passwordHash: entity.passwordHash,
    createdAt: entity.createdAt.toISOString(),
    confirmationCode: entity.confirmationCode,
    confirmationExpiration: entity.confirmationExpiration,
    isConfirmed: entity.isConfirmed,
    recoveryCode: entity.recoveryCode,
    recoveryExpiration: entity.recoveryExpiration,
  };
}

export function toOrm(model: UserModel): UserOrmEntity {
  const entity = new UserOrmEntity();
  entity.id = model.id;
  entity.login = model.login;
  entity.email = model.email;
  entity.passwordHash = model.passwordHash;
  entity.createdAt = new Date(model.createdAt);
  entity.confirmationCode = model.confirmationCode;
  entity.confirmationExpiration = model.confirmationExpiration;
  entity.isConfirmed = model.isConfirmed;
  entity.recoveryCode = model.recoveryCode;
  entity.recoveryExpiration = model.recoveryExpiration;
  return entity;
}

export function modelToDb(model: UserModel): UserDb {
  return {
    id: model.id,
    login: model.login,
    email: model.email,
    passwordHash: model.passwordHash,
    createdAt: new Date(model.createdAt),
    confirmationCode: model.confirmationCode,
    confirmationExpiration: model.confirmationExpiration,
    isConfirmed: model.isConfirmed,
    recoveryCode: model.recoveryCode,
    recoveryExpiration: model.recoveryExpiration,
  };
}

export function fromEntity(entity: UserEntity): UserModel {
  const data = entity.toDb();
  return {
    id: data.id,
    login: data.login,
    email: data.email,
    passwordHash: data.passwordHash,
    createdAt: data.createdAt.toISOString(),
    confirmationCode: data.confirmationCode,
    confirmationExpiration: data.confirmationExpiration,
    isConfirmed: data.isConfirmed,
    recoveryCode: data.recoveryCode,
    recoveryExpiration: data.recoveryExpiration,
  };
}
