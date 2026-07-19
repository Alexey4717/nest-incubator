import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenViewDto {
  @ApiProperty({ example: 'jwt-access-token' })
  accessToken = '';
}

export class MeViewDto {
  @ApiProperty({ example: 'user@example.com' })
  email = '';

  @ApiProperty({ example: 'userLogin' })
  login = '';

  @ApiProperty({ example: 'uuid' })
  userId = '';
}
