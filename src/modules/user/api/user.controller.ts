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
  NotFoundException,
} from '@nestjs/common';
import { constants } from 'http2';
import { UserService } from '../application/user.service';
import { UserQueryRepository } from '../infrastructure/user-query.repository';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { getMappedUserViewModel } from '../helpers';
import { GetUsersInputModel, SortUsersBy } from '../models/GetUsersInputModel';
import { SortDirections } from '../../../types/common';
import { CreateUserInputModel } from '../models/CreateUserInputModel';
import { CreateUserDTO } from '../dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userQueryRepository: UserQueryRepository,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getUsers(
    @Query()
    {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    }: GetUsersInputModel,
  ) {
    const resData = await this.userQueryRepository.getUsers({
      searchLoginTerm: searchLoginTerm || null, // by-default null
      searchEmailTerm: searchEmailTerm || null, // by-default null
      sortBy: (sortBy || 'createdAt') as SortUsersBy, // by-default createdAt
      sortDirection: sortDirection || SortDirections.desc, // by-default desc
      pageNumber: +(pageNumber || 1), // by-default 1
      pageSize: +(pageSize || 10), // by-default 10
    });
    const {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items,
    } = resData || {};
    return {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items: items.map(getMappedUserViewModel),
    };
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createUser(@Body() inputModel: CreateUserDTO) {
    // const createdUser = this.authService.createUser(inputModel);
    const createdUser = await this.userService.createUser(inputModel);
    return getMappedUserViewModel(createdUser);
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteUser(@Param() params: DeleteUserInputModel) {
    const resData = await this.userService.deleteUserById(params.id);
    if (!resData) throw new NotFoundException();
    return resData;
  }
}
