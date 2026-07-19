import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from '../constants/pagination';
import { SortDirections } from '../types/common';

export class BaseQueryParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = DEFAULT_PAGE_SIZE;

  @IsIn([SortDirections.desc, SortDirections.asc])
  sortDirection: SortDirections = DEFAULT_SORT_DIRECTION;

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
