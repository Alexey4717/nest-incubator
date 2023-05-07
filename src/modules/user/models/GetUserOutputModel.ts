import { AccountDataType, UserType } from './CreateUserInsertToDBModel';

export type GetUserOutputModel = UserType;

export type GetUserOutputModelFromMongoDB = GetUserOutputModel & {
  /**
   * Inserted id user from mongodb
   */
  id: string;
};

export type GetMappedUserOutputModel = Omit<AccountDataType, 'passwordHash'> & {
  /**
   * Mapped id of user from db
   */
  id: string;
};
