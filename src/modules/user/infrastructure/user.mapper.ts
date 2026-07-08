import { UserModel } from '../models/user.model';
import { UserEntity } from './user.entity';

export function toDomain(entity: UserEntity): UserModel {
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

export function toOrm(model: UserModel): UserEntity {
  const entity = new UserEntity();
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
