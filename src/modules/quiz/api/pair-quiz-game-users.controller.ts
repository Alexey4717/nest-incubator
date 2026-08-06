import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';

import { AccessJwtAuthGuard } from '@/modules/auth/guards/access-jwt-auth.guard';

import { GetMyStatisticQuery } from '../application/queries/get-my-statistic.query';
import { ApiGetMyStatistic } from './pair-quiz-game.swagger.decorators';

@SkipThrottle()
@ApiTags('PairQuizGame')
@ApiBearerAuth()
@UseGuards(AccessJwtAuthGuard)
@Controller('pair-game-quiz/users')
export class PairQuizGameUsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('my-statistic')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetMyStatistic()
  getMyStatistic(@CurrentUserId() userId: string) {
    return this.queryBus.execute(new GetMyStatisticQuery(userId));
  }
}
