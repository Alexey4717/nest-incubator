import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { queryParamToStringWithDefault } from '@/core/decorators/validation/empty-to-undefined.transform';
import { Trim } from '@/core/decorators/validation/trim.decorator';
import { BaseQueryParamsDto } from '@/core/dto/base-query-params.dto';

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
