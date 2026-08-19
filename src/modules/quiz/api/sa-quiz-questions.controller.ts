import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';

import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';

import { CreateQuizQuestionCommand } from '../application/commands/create-quiz-question.command';
import { DeleteQuizQuestionCommand } from '../application/commands/delete-quiz-question.command';
import { PublishQuizQuestionCommand } from '../application/commands/publish-quiz-question.command';
import { UpdateQuizQuestionCommand } from '../application/commands/update-quiz-question.command';
import { GetQuizQuestionsQuery } from '../application/queries/get-quiz-questions.query';
import {
  CreateQuizQuestionDto,
  GetQuizQuestionsQueryParamsDto,
  PublishQuizQuestionDto,
  UpdateQuizQuestionDto,
} from '../dto/quiz-question.dto';
import {
  ApiSaCreateQuizQuestion,
  ApiSaDeleteQuizQuestion,
  ApiSaGetQuizQuestions,
  ApiSaPublishQuizQuestion,
  ApiSaUpdateQuizQuestion,
} from './sa-quiz.swagger.decorators';

@SkipThrottle()
@ApiTags('QuizQuestions')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class SaQuizQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiSaGetQuizQuestions()
  async getQuestions(@Query() query: GetQuizQuestionsQueryParamsDto) {
    return this.queryBus.execute(new GetQuizQuestionsQuery(query));
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  @ApiSaCreateQuizQuestion()
  async createQuestion(@Body() body: CreateQuizQuestionDto) {
    return notificationToDomainException(
      await this.commandBus.execute(new CreateQuizQuestionCommand(body)),
    );
  }

  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaUpdateQuizQuestion()
  async updateQuestion(@Param() params: { id: string }, @Body() body: UpdateQuizQuestionDto) {
    notificationToDomainException(
      await this.commandBus.execute(new UpdateQuizQuestionCommand(params.id, body)),
    );
  }

  @Put(':id/publish')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaPublishQuizQuestion()
  async publishQuestion(@Param() params: { id: string }, @Body() body: PublishQuizQuestionDto) {
    notificationToDomainException(
      await this.commandBus.execute(new PublishQuizQuestionCommand(params.id, body)),
    );
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaDeleteQuizQuestion()
  async deleteQuestion(@Param() params: { id: string }) {
    notificationToDomainException(
      await this.commandBus.execute(new DeleteQuizQuestionCommand(params.id)),
    );
  }
}
