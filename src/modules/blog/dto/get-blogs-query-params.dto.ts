import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { BaseQueryParamsDto } from '@/core/dto/base-query-params.dto';

export type SortBlogsBy = 'name' | 'websiteUrl' | 'description' | 'isMembership' | 'createdAt';

export class GetBlogsQueryParamsDto extends BaseQueryParamsDto {
  /** Field to sort blogs by */
  @ApiProperty({
    enum: ['name', 'websiteUrl', 'description', 'isMembership', 'createdAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsIn(['name', 'websiteUrl', 'description', 'isMembership', 'createdAt'])
  sortBy: SortBlogsBy = 'createdAt';

  /** Search term for blog name */
  @ApiPropertyOptional({ example: 'blog' })
  @IsOptional()
  @IsString()
  searchNameTerm?: string;
}
