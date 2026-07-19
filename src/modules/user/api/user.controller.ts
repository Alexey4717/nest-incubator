import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { throwIfNotFound } from '@/core/utils/throw-if-not-found';

import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';

import { CreateUserCommand } from '../application/commands/create-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user.command';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { CreateUserDTO } from '../dto/create-user.dto';
import { GetUsersQueryParamsDto } from '../dto/get-users-query-params.dto';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { toUserViewModel } from '../utils/user.view-mapper';
import { ApiCreateUser, ApiDeleteUser, ApiGetUsers } from './user.swagger.decorators';

@SkipThrottle()
@ApiTags('Users (Admin)')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetUsers()
  async getUsers(@Query() query: GetUsersQueryParamsDto) {
    return this.queryBus.execute(new GetUsersQuery(query));
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  @ApiCreateUser()
  async createUser(@Body() inputModel: CreateUserDTO) {
    const createdUser = await this.commandBus.execute(new CreateUserCommand(inputModel));
    return toUserViewModel(createdUser);
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiDeleteUser()
  async deleteUser(@Param() params: DeleteUserInputModel) {
    const resData = await this.commandBus.execute(new DeleteUserCommand(params.id));
    throwIfNotFound(resData || null);
  }
}
