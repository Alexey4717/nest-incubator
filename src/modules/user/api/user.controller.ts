import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';

import { CreateUserCommand } from '../application/commands/create-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user.command';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { CreateUserDTO } from '../dto/create-user.dto';
import { GetUsersQueryParamsDto } from '../dto/get-users-query-params.dto';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { toUserViewModel } from '../utils/user.view-mapper';

@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getUsers(@Query() query: GetUsersQueryParamsDto) {
    return this.queryBus.execute(new GetUsersQuery(query));
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createUser(@Body() inputModel: CreateUserDTO) {
    const createdUser = await this.commandBus.execute(new CreateUserCommand(inputModel));
    return toUserViewModel(createdUser);
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteUser(@Param() params: DeleteUserInputModel) {
    const resData = await this.commandBus.execute(new DeleteUserCommand(params.id));
    if (!resData) throw new NotFoundException();
    return resData;
  }
}
