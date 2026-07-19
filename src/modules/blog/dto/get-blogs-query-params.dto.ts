import { IsIn, IsOptional, IsString } from 'class-validator';

import { BaseQueryParamsDto } from '@/shared/dto/base-query-params.dto';

export type SortBlogsBy = 'name' | 'websiteUrl' | 'description' | 'isMembership' | 'createdAt';

export class GetBlogsQueryParamsDto extends BaseQueryParamsDto {
  @IsIn(['name', 'websiteUrl', 'description', 'isMembership', 'createdAt'])
  sortBy: SortBlogsBy = 'createdAt';

  @IsOptional()
  @IsString()
  searchNameTerm?: string;
}
