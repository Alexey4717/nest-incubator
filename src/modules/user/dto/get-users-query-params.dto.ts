import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { BaseQueryParamsDto } from '@/shared/dto/base-query-params.dto';

export type SortUsersBy = 'login' | 'email' | 'createdAt';

export class GetUsersQueryParamsDto extends BaseQueryParamsDto {
  /** Field to sort users by */
  @ApiProperty({
    enum: ['login', 'email', 'createdAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsIn(['login', 'email', 'createdAt'])
  sortBy: SortUsersBy = 'createdAt';

  /** Search term for user login */
  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  searchLoginTerm?: string;

  /** Search term for user email */
  @ApiPropertyOptional({ example: 'example.com' })
  @IsOptional()
  @IsString()
  searchEmailTerm?: string;
}
