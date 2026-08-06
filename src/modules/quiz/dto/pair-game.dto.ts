import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/core/constants/pagination';
import {
  queryParamToIntWithDefault,
  queryParamToStringWithDefault,
} from '@/core/decorators/validation/empty-to-undefined.transform';
import { Trim } from '@/core/decorators/validation/trim.decorator';
import { BaseQueryParamsDto } from '@/core/dto/base-query-params.dto';

import { DEFAULT_TOP_USERS_SORT, TOP_USERS_SORT_ITEM_PATTERN } from './parse-top-users-sort';

function toTopUsersSortArray({ value }: TransformFnParams): string[] {
  if (value === undefined || value === null) {
    return [...DEFAULT_TOP_USERS_SORT];
  }

  if (Array.isArray(value)) {
    const items = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item !== '' && item !== 'null' && item !== 'undefined');

    return items.length > 0 ? items : [...DEFAULT_TOP_USERS_SORT];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? [...DEFAULT_TOP_USERS_SORT] : [trimmed];
  }

  return [...DEFAULT_TOP_USERS_SORT];
}

export class SubmitPairGameAnswerDto {
  @ApiProperty({ example: 'Paris' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  answer = '';
}

export class GetMyPairGamesQueryParamsDto extends BaseQueryParamsDto {
  @ApiPropertyOptional({ type: String, default: 'pairCreatedDate', example: 'pairCreatedDate' })
  @Transform(queryParamToStringWithDefault('pairCreatedDate'))
  @IsOptional()
  @IsString()
  sortBy = 'pairCreatedDate';
}

export class GetTopUsersQueryParamsDto {
  @ApiProperty({ default: DEFAULT_PAGE_NUMBER, minimum: 1, example: 1 })
  @Transform(queryParamToIntWithDefault(DEFAULT_PAGE_NUMBER))
  @IsInt()
  @Min(1)
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  @ApiProperty({ default: DEFAULT_PAGE_SIZE, minimum: 1, maximum: 100, example: 10 })
  @Transform(queryParamToIntWithDefault(DEFAULT_PAGE_SIZE))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    type: [String],
    isArray: true,
    default: [...DEFAULT_TOP_USERS_SORT],
    example: [...DEFAULT_TOP_USERS_SORT],
    description:
      'Multi-criteria sort: "field direction". Allowed fields: avgScores, sumScore, winsCount, lossesCount',
  })
  @Transform(toTopUsersSortArray)
  @IsArray()
  @IsString({ each: true })
  @Matches(TOP_USERS_SORT_ITEM_PATTERN, { each: true })
  sort: string[] = [...DEFAULT_TOP_USERS_SORT];

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
