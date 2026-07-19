import { IsIn } from 'class-validator';

import { BaseQueryParamsDto } from '@/shared/dto/base-query-params.dto';

export type SortPostCommentsBy = 'content' | 'createdAt';

export class GetPostCommentsQueryParamsDto extends BaseQueryParamsDto {
  @IsIn(['content', 'createdAt'])
  sortBy: SortPostCommentsBy = 'createdAt';
}
