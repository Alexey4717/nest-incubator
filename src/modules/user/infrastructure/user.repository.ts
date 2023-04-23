import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/User.schema';
import { Model, Types } from 'mongoose';
import {
  CreateUserInsertToDBModel,
  RecoveryDataType,
} from '../models/CreateUserInsertToDBModel';
import { GetUserOutputModelFromMongoDB } from '../models/GetUserOutputModel';

type UpdateUserConfirmationCodeInputType = {
  userId: Types.ObjectId;
  newCode: string;
};

type ChangeUserPasswordArgs = {
  userId: Types.ObjectId;
  passwordHash: string;
};

type SetUserRecoveryDataInputType = {
  userId: Types.ObjectId;
  recoveryData: RecoveryDataType;
};

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async createUser(
    newUser: CreateUserInsertToDBModel,
  ): Promise<GetUserOutputModelFromMongoDB> {
    try {
      return await this.UserModel.create(newUser);
    } catch (error) {
      console.log(`usersRepository.createUser error is occurred: ${error}`);
      return {} as GetUserOutputModelFromMongoDB;
    }
  }

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const result = await this.UserModel.deleteOne({
        _id: new Types.ObjectId(id),
      });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`usersRepository.deleteUserById error is occurred: ${error}`);
      return false;
    }
  }

  async updateConfirmation(userId: Types.ObjectId): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.matchedCount === 1;
  }

  async changeUserPasswordAndNullifyRecoveryData({
    userId,
    passwordHash,
  }: ChangeUserPasswordArgs): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'accountData.passwordHash': passwordHash,
          recoveryData: null,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async setUserRecoveryData({
    userId,
    recoveryData,
  }: SetUserRecoveryDataInputType): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      { $set: { recoveryData } },
    );
    return result.matchedCount === 1;
  }

  async updateUserConfirmationCode({
    userId,
    newCode,
  }: UpdateUserConfirmationCodeInputType): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.confirmationCode': newCode } },
    );
    return result.matchedCount === 1;
  }
}
