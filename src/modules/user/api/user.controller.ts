import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { constants } from 'http2';
import { UserService } from '../application/user.service';
import { UserQueryRepository } from '../infrastructure/user-query.repository';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { getMappedUserViewModel } from '../helpers';
import { GetUsersInputModel, SortUsersBy } from '../models/GetUsersInputModel';
import { SortDirections } from '../../../types/common';
import { CreateUserInputModel } from '../models/CreateUserInputModel';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userQueryRepository: UserQueryRepository,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getUsers(@Query() query: GetUsersInputModel) {
    // return this.userService.getUsers(query?.term);

    const resData = await this.userQueryRepository.getUsers({
      searchLoginTerm: query.searchLoginTerm?.toString() || null, // by-default null
      searchEmailTerm: query.searchEmailTerm?.toString() || null, // by-default null
      sortBy: (query.sortBy?.toString() || 'createdAt') as SortUsersBy, // by-default createdAt
      sortDirection: (query.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query.pageNumber || 1), // by-default 1
      pageSize: +(query.pageSize || 10), // by-default 10
    });
    const { pagesCount, page, pageSize, totalCount, items } = resData || {};
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(getMappedUserViewModel),
    };
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createUser(@Body() inputModel: CreateUserInputModel) {
    // const createdUser = this.authService.createUser(inputModel);
    const createdUser = await this.userService.createUser(inputModel);
    return getMappedUserViewModel(createdUser);
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteUser(@Param() params: DeleteUserInputModel) {
    return this.userService.deleteUserById(params.id);
  }
}
