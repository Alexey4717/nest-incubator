import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

interface CreateUserInputModel {
  name: string;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query() query: { term: string }) {
    return this.userService.getUsers(query?.term);
  }

  @Get(':id')
  findUserById(@Param('id') userId: string) {
    return this.userService.findUserById(+userId);
  }

  @Post()
  createUser(@Body() inputModel: CreateUserInputModel) {
    return this.userService.createUser(inputModel.name);
  }

  @Put(':id')
  updateUser(
    @Param('id') userId: string,
    @Body() inputModel: CreateUserInputModel,
  ) {
    return this.userService.updateUser(+userId, inputModel.name);
  }

  @Delete(':id')
  deleteUser(@Param() params: { id: string }) {
    return this.userService.deleteUser(+params.id);
  }
}
