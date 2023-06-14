import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/User.schema';
import {
  CommonQueryParamsTypes,
  Paginator,
  SortDirections,
} from '../../../types/common';
import { calculateAndGetSkipValue } from '../../../helpers';
import { GetUserOutputModelFromMongoDB } from '../models/GetUserOutputModel';
import { SortUsersBy } from '../models/GetUsersInputModel';
import { ObjectId } from 'mongodb';

type GetUsersArgs = CommonQueryParamsTypes & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  sortBy: SortUsersBy;
};

@Injectable()
export class UserQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async getUsers({
    searchLoginTerm,
    searchEmailTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetUsersArgs): Promise<Paginator<GetUserOutputModelFromMongoDB[]>> {
    let filter = {} as any;

    if (searchLoginTerm && !searchEmailTerm) {
      filter['accountData.login'] = {
        $regex: searchLoginTerm,
        $options: 'i',
      };
    } else if (searchEmailTerm && !searchLoginTerm) {
      filter['accountData.email'] = {
        $regex: searchEmailTerm,
        $options: 'i',
      };
    } else if (searchLoginTerm && searchLoginTerm) {
      filter = {
        $or: [
          {
            [`accountData.login`]: {
              $regex: searchLoginTerm,
              $options: 'i',
            },
          },
          {
            [`accountData.email`]: { $regex: searchEmailTerm, $options: 'i' },
          },
        ],
      };
    }

    const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
    const items = await this.UserModel.find(filter)
      .sort({ [`accountData.${sortBy}`]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipValue)
      .limit(pageSize)
      .lean();

    // const items = await this.UserModel.aggregate([
    //   { $match: filter },
    //   { $sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 } },
    //   { $skip: skipValue },
    //   { $limit: pageSize },
    //   {
    //     $project: {
    //       id: true,
    //       accountData: '$accountData',
    //     },
    //   },
    // ]);

    const totalCount = await this.UserModel.count(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    return {
      page: pageNumber,
      pageSize,
      totalCount,
      pagesCount,
      items,
    };
  }

  async findUserById(
    id: ObjectId,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.UserModel.findOne({ id }).lean();
  }

  async findUserByLogin(login: string): Promise<User | null> {
    return this.UserModel.findOne(
      { 'accountData.login': login },
      { _id: false },
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.UserModel.findOne(
      { 'accountData.email': email },
      { _id: false },
    );
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    }).lean();
  }

  async findByConfirmationCode(
    code: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).lean();
  }

  async findUserByRecoveryCode(
    code: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.UserModel.findOne({ 'recoveryData.recoveryCode': code }).lean();
  }
}
