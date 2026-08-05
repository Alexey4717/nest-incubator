import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from '../constants/pagination';
import {
  queryParamToIntWithDefault,
  queryParamToStringWithDefault,
} from '../decorators/validation/empty-to-undefined.transform';
import { SortDirections } from '../types/common';

export class BaseQueryParamsDto {
  /** Page number for pagination (starts from 1) */
  @ApiProperty({ default: DEFAULT_PAGE_NUMBER, minimum: 1, example: 1 })
  @Transform(queryParamToIntWithDefault(DEFAULT_PAGE_NUMBER))
  @IsInt()
  @Min(1)
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  /** Number of items per page (max 100) */
  @ApiProperty({ default: DEFAULT_PAGE_SIZE, minimum: 1, maximum: 100, example: 10 })
  @Transform(queryParamToIntWithDefault(DEFAULT_PAGE_SIZE))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = DEFAULT_PAGE_SIZE;

  /** Sort direction: asc or desc */
  @ApiProperty({
    enum: ['asc', 'desc'],
    default: DEFAULT_SORT_DIRECTION,
    example: 'desc',
  })
  @Transform(queryParamToStringWithDefault(DEFAULT_SORT_DIRECTION))
  @IsIn([SortDirections.desc, SortDirections.asc])
  sortDirection: SortDirections = DEFAULT_SORT_DIRECTION;

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
