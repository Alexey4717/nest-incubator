import { IsIn, IsOptional, IsString } from 'class-validator';

import { BaseQueryParamsDto } from '@/shared/dto/base-query-params.dto';

export type SortUsersBy = 'login' | 'email' | 'createdAt';

export class GetUsersQueryParamsDto extends BaseQueryParamsDto {
  @IsIn(['login', 'email', 'createdAt'])
  sortBy: SortUsersBy = 'createdAt';

  @IsOptional()
  @IsString()
  searchLoginTerm?: string;

  @IsOptional()
  @IsString()
  searchEmailTerm?: string;
}
