import { AccountDataType, UserType } from './CreateUserInsertToDBModel';

export type GetUserOutputModel = UserType;

export type GetUserOutputModelFromMongoDB = GetUserOutputModel & {
  /**
   * Inserted id user from mongodb
   */
  id: string;
};

export type GetMappedUserFields = Omit<AccountDataType, 'passwordHash'>;
