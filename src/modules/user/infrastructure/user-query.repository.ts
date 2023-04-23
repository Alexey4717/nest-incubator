import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/User.schema';
import { Model, Types } from 'mongoose';
import {
  CommonQueryParamsTypes,
  Paginator,
  SortDirections,
} from '../../../types/common';
import { calculateAndGetSkipValue } from '../../../helpers';
import { GetUserOutputModelFromMongoDB } from '../models/GetUserOutputModel';
import { SortUsersBy } from '../models/GetUsersInputModel';

type GetUsersArgs = CommonQueryParamsTypes & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  sortBy: SortUsersBy;
};

@Injectable()
export class UserQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

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
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
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
    id: Types.ObjectId,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    try {
      return await this.UserModel.findOne({
        _id: new Types.ObjectId(id),
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
