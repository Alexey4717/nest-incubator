import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiValidationError } from '@/core/swagger/decorators/common.swagger.decorators';
import { PaginatedQuizQuestionsViewDto, QuizQuestionViewDto } from '@/core/swagger/quiz-view.dto';

import {
  CreateQuizQuestionDto,
  PublishQuizQuestionDto,
  UpdateQuizQuestionDto,
} from '../dto/quiz-question.dto';

const UNAUTHORIZED_DESCRIPTION = 'Invalid basic auth credentials';

export function ApiSaGetQuizQuestions() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns quiz questions with pagination and filters' }),
    ApiOkResponse({ type: PaginatedQuizQuestionsViewDto }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiSaCreateQuizQuestion() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new quiz question' }),
    ApiBody({ type: CreateQuizQuestionDto }),
    ApiCreatedResponse({ type: QuizQuestionViewDto }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiSaUpdateQuizQuestion() {
  return applyDecorators(
    ApiOperation({ summary: 'Update quiz question by id' }),
    ApiParam({ name: 'id', description: 'Question id' }),
    ApiBody({ type: UpdateQuizQuestionDto }),
    ApiNoContentResponse({ description: 'Question updated' }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Question not found' }),
  );
}

export function ApiSaPublishQuizQuestion() {
  return applyDecorators(
    ApiOperation({ summary: 'Publish or unpublish quiz question' }),
    ApiParam({ name: 'id', description: 'Question id' }),
    ApiBody({ type: PublishQuizQuestionDto }),
    ApiNoContentResponse({ description: 'Publish status updated' }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Question not found' }),
  );
}

export function ApiSaDeleteQuizQuestion() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete quiz question by id' }),
    ApiParam({ name: 'id', description: 'Question id' }),
    ApiNoContentResponse({ description: 'Question deleted' }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Question not found' }),
  );
}
