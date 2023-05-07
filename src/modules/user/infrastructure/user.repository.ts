import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/User.schema';
import {
  CreateUserInsertToDBModel,
  RecoveryDataType,
} from '../models/CreateUserInsertToDBModel';
import { GetUserOutputModelFromMongoDB } from '../models/GetUserOutputModel';
import { ObjectId } from 'mongodb';

type UpdateUserConfirmationCodeInputType = {
  userId: ObjectId;
  newCode: string;
};

type ChangeUserPasswordArgs = {
  userId: string;
  passwordHash: string;
};

type SetUserRecoveryDataInputType = {
  userId: ObjectId;
  recoveryData: RecoveryDataType;
};

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async createUser(newUser: User): Promise<GetUserOutputModelFromMongoDB> {
    try {
      return await this.UserModel.create({ ...newUser });
    } catch (error) {
      console.log(`usersRepository.createUser error is occurred: ${error}`);
      return {} as GetUserOutputModelFromMongoDB;
    }
  }

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const result = await this.UserModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`usersRepository.deleteUserById error is occurred: ${error}`);
      return false;
    }
  }

  async updateConfirmation(userId: string): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.matchedCount === 1;
  }

  async changeUserPasswordAndNullifyRecoveryData({
    userId,
    passwordHash,
  }: ChangeUserPasswordArgs): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { id: userId },
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
      { id: userId },
      { $set: { recoveryData } },
    );
    return result.matchedCount === 1;
  }

  async updateUserConfirmationCode({
    userId,
    newCode,
  }: UpdateUserConfirmationCodeInputType): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { id: userId },
      { $set: { 'emailConfirmation.confirmationCode': newCode } },
    );
    return result.matchedCount === 1;
  }
}
