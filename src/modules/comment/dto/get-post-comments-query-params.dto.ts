import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { BaseQueryParamsDto } from '@/shared/dto/base-query-params.dto';

export type SortPostCommentsBy = 'content' | 'createdAt';

export class GetPostCommentsQueryParamsDto extends BaseQueryParamsDto {
  /** Field to sort comments by */
  @ApiProperty({
    enum: ['content', 'createdAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsIn(['content', 'createdAt'])
  sortBy: SortPostCommentsBy = 'createdAt';
}
