import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.schema';
import { RecoveryDataType } from '../models/CreateUserInsertToDBModel';
import { GetUserOutputModelFromMongoDB } from '../models/GetUserOutputModel';

type UpdateUserConfirmationCodeInputType = {
  userId: string;
  newCode: string;
};

type ChangeUserPasswordArgs = {
  userId: string;
  passwordHash: string;
};

type SetUserRecoveryDataInputType = {
  userId: string;
  recoveryData: RecoveryDataType;
};

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async createUser(newUser: User): Promise<GetUserOutputModelFromMongoDB> {
    try {
      return await this.UserModel.create({ ...newUser });
    } catch (error: unknown) {
      const mongoErr = error as {
        code?: number;
        keyValue?: Record<string, string>;
        message?: string;
      };
      if (mongoErr?.code === 11000) {
        const errs = this.duplicateKeyToErrorsMessages(
          mongoErr.keyValue ?? {},
          mongoErr.message ?? '',
        );
        throw new BadRequestException({
          message: errs,
          error: 'Bad Request',
        });
      }
      console.log(`usersRepository.createUser error is occurred: ${error}`);
      throw error;
    }
  }

  private duplicateKeyToErrorsMessages(
    keyValue: Record<string, string>,
    mongoMessage: string,
  ): { message: string; field: string }[] {
    const out: { message: string; field: string }[] = [];
    for (const path of Object.keys(keyValue || {})) {
      const normalized = path.toLowerCase().replace(/^accountdata\./, '');
      if (
        normalized === 'login' ||
        normalized.endsWith('.login') ||
        normalized.includes('login')
      ) {
        out.push({
          message: 'This login already exists',
          field: 'login',
        });
      } else if (normalized.includes('email')) {
        out.push({
          message: 'This email already exists',
          field: 'email',
        });
      }
    }
    if (out.length === 0) {
      const msg = mongoMessage.toLowerCase();
      if (msg.includes('login') || msg.includes('.login'))
        out.push({
          message: 'This login already exists',
          field: 'login',
        });
      if (msg.includes('.email') || /\bemail\b/.test(msg))
        out.push({
          message: 'This email already exists',
          field: 'email',
        });
    }
    if (out.length === 0) {
      return [{ message: 'Duplicate key constraint violated', field: 'login' }];
    }
    return out;
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

  async updateRecoveryPasswordInfo(userId: string, recoveryCode: string) {
    return this.UserModel.updateOne(
      { id: userId },
      {
        $set: {
          'recoveryData.expirationDate': new Date().toISOString(),
          'recoveryData.recoveryCode': recoveryCode,
        },
      },
    );
  }
}
