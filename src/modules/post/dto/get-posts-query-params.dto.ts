import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { BaseQueryParamsDto } from '@/core/dto/base-query-params.dto';

export type SortPostsBy = 'title' | 'blogName' | 'createdAt';

export class GetPostsQueryParamsDto extends BaseQueryParamsDto {
  /** Field to sort posts by */
  @ApiProperty({
    enum: ['title', 'blogName', 'createdAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsIn(['title', 'blogName', 'createdAt'])
  sortBy: SortPostsBy = 'createdAt';
}
