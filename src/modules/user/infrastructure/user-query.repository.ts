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
    try {
      let filter = {} as any;

      if (searchLoginTerm && !searchEmailTerm) {
        filter.login = { $regex: searchLoginTerm, $options: 'i' };
      } else if (searchEmailTerm && !searchLoginTerm) {
        filter.email = { $regex: searchEmailTerm, $options: 'i' };
      } else if (searchLoginTerm && searchLoginTerm) {
        filter = {
          $or: [
            {
              login: {
                $regex: searchLoginTerm,
                $options: 'i',
              },
            },
            { email: { $regex: searchEmailTerm, $options: 'i' } },
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
      //       _id: true,
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
    } catch (error) {
      console.log(`usersQueryRepository.getUsers error is occurred: ${error}`);
      return {} as Paginator<GetUserOutputModelFromMongoDB[]>;
    }
  }

  async findUserById(
    id: ObjectId,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    try {
      return await this.UserModel.findOne({
        _id: new ObjectId(id),
      }).lean();
    } catch (error) {
      console.log(
        `usersQueryRepository.findUserById error is occurred: ${error}`,
      );
      return {} as GetUserOutputModelFromMongoDB;
    }
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    try {
      return await this.UserModel.findOne({
        $or: [
          { 'accountData.login': loginOrEmail },
          { 'accountData.email': loginOrEmail },
        ],
      }).lean();
    } catch (error) {
      console.log(
        `usersQueryRepository.findByLoginOrEmail error is occurred: ${error}`,
      );
      return {} as GetUserOutputModelFromMongoDB;
    }
  }

  async findByConfirmationCode(
    code: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    try {
      return this.UserModel.findOne({
        'emailConfirmation.confirmationCode': code,
      }).lean();
    } catch (error) {
      console.log(
        `usersQueryRepository.findByConfirmationCode error is occurred: ${error}`,
      );
      return {} as GetUserOutputModelFromMongoDB;
    }
  }

  async findUserByRecoveryCode(
    code: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.UserModel.findOne({ 'recoveryData.recoveryCode': code }).lean();
  }
}
