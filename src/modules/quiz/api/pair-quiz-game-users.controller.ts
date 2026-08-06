import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';

import { AccessJwtAuthGuard } from '@/modules/auth/guards/access-jwt-auth.guard';

import { GetMyStatisticQuery } from '../application/queries/get-my-statistic.query';
import { GetTopUsersQuery } from '../application/queries/get-top-users.query';
import { GetTopUsersQueryParamsDto } from '../dto/pair-game.dto';
import { ApiGetMyStatistic, ApiGetTopUsers } from './pair-quiz-game.swagger.decorators';

@SkipThrottle()
@ApiTags('PairQuizGame')
@Controller('pair-game-quiz/users')
export class PairQuizGameUsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('top')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetTopUsers()
  getTop(@Query() query: GetTopUsersQueryParamsDto) {
    return this.queryBus.execute(new GetTopUsersQuery(query));
  }

  @Get('my-statistic')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiBearerAuth()
  @UseGuards(AccessJwtAuthGuard)
  @ApiGetMyStatistic()
  getMyStatistic(@CurrentUserId() userId: string) {
    return this.queryBus.execute(new GetMyStatisticQuery(userId));
  }
}
