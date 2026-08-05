import { ApiProperty } from '@nestjs/swagger';

import { PaginatedMetaDto } from './paginated-meta.dto';

export class QuizQuestionViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'What is the capital of France?' })
  body = '';

  @ApiProperty({ type: [String], example: ['Paris'] })
  correctAnswers: string[] = [];

  @ApiProperty({ example: false })
  published = false;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt = '';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt = '';
}

export class PaginatedQuizQuestionsViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [QuizQuestionViewDto] })
  items: QuizQuestionViewDto[] = [];
}
