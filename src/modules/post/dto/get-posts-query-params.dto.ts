import { IsIn } from 'class-validator';

import { BaseQueryParamsDto } from '@/shared/dto/base-query-params.dto';

export type SortPostsBy = 'title' | 'blogName' | 'createdAt';

export class GetPostsQueryParamsDto extends BaseQueryParamsDto {
  @IsIn(['title', 'blogName', 'createdAt'])
  sortBy: SortPostsBy = 'createdAt';
}
