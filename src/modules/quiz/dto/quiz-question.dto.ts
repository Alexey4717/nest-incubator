import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Trim } from '@/core/decorators/validation/trim.decorator';
import { BaseQueryParamsDto } from '@/core/dto/base-query-params.dto';

export enum PublishedStatusFilter {
  all = 'all',
  published = 'published',
  notPublished = 'notPublished',
}

export type SortQuizQuestionsBy = 'createdAt';

export class GetQuizQuestionsQueryParamsDto extends BaseQueryParamsDto {
  @ApiPropertyOptional({ example: 'capital' })
  @IsOptional()
  @IsString()
  bodySearchTerm?: string;

  @ApiProperty({ enum: PublishedStatusFilter, default: PublishedStatusFilter.all })
  @IsIn(Object.values(PublishedStatusFilter))
  publishedStatus: PublishedStatusFilter = PublishedStatusFilter.all;

  @ApiProperty({ enum: ['createdAt'], default: 'createdAt' })
  @IsIn(['createdAt'])
  sortBy: SortQuizQuestionsBy = 'createdAt';
}

export class CreateQuizQuestionDto {
  @ApiProperty({ maxLength: 1000, example: 'What is the capital of France?' })
  @Trim()
  @IsString()
  @MaxLength(1000)
  body = '';

  @ApiProperty({ type: [String], example: ['Paris'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctAnswers: string[] = [];
}

export class UpdateQuizQuestionDto extends CreateQuizQuestionDto {}

export class PublishQuizQuestionDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  published = false;
}
