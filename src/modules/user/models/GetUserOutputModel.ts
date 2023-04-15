import {ObjectId} from 'mongodb';
import {AccountDataType, UserType} from "./CreateUserInsertToDBModel";


export type GetUserOutputModel = UserType;

export type GetUserOutputModelFromMongoDB = GetUserOutputModel & {
    /**
     * Inserted id user from mongodb
     */
    _id: ObjectId
};

export type GetMappedUserOutputModel = Omit<AccountDataType, 'passwordHash'> & {
    /**
     * Mapped id of user from db
     */
    id: string
};
