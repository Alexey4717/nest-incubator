import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiValidationError } from '@/core/swagger/decorators/common.swagger.decorators';
import { PaginatedUsersViewDto, UserViewDto } from '@/core/swagger/user-view.dto';

import { CreateUserDTO } from '../dto/create-user.dto';

const UNAUTHORIZED_DESCRIPTION = 'Invalid basic auth credentials';

export function ApiGetUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns users with pagination and sorting' }),
    ApiOkResponse({ type: PaginatedUsersViewDto }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new user' }),
    ApiBody({ type: CreateUserDTO }),
    ApiCreatedResponse({ type: UserViewDto }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user by id' }),
    ApiParam({ name: 'id', description: 'User id' }),
    ApiNoContentResponse({ description: 'User deleted' }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
}
