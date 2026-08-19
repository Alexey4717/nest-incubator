import { UserDb, UserEntity } from '../domain/entities/user.entity';
import { UserModel } from '../models/user.model';
import { UserOrmEntity } from './user.orm-entity';

export type UserRawRow = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  confirmationCode: string | null;
  confirmationExpiration: Date | null;
  isConfirmed: boolean;
  recoveryCode: string | null;
  recoveryExpiration: Date | null;
};

export function fromRaw(row: UserRawRow): UserModel {
  return {
    id: row.id,
    login: row.login,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
    confirmationCode: row.confirmationCode,
    confirmationExpiration: row.confirmationExpiration,
    isConfirmed: row.isConfirmed,
    recoveryCode: row.recoveryCode,
    recoveryExpiration: row.recoveryExpiration,
  };
}

export function toDomain(entity: UserOrmEntity): UserModel {
  return {
    id: entity.publicId,
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
