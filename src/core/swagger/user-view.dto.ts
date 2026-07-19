import { ApiProperty } from '@nestjs/swagger';

import { PaginatedMetaDto } from './paginated-meta.dto';

export class UserViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'userLogin' })
  login = '';

  @ApiProperty({ example: 'user@example.com' })
  email = '';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt = '';
}

export class PaginatedUsersViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [UserViewDto] })
  items: UserViewDto[] = [];
}
