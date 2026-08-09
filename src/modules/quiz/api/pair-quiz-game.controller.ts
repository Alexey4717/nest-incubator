import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { AccessJwtAuthGuard } from '@/modules/auth/guards/access-jwt-auth.guard';

import { ConnectPairGameCommand } from '../application/commands/connect-pair-game.command';
import { SubmitPairGameAnswerCommand } from '../application/commands/submit-pair-game-answer.command';
import { GetMyCurrentPairGameQuery } from '../application/queries/get-my-current-pair-game.query';
import { GetMyPairGamesQuery } from '../application/queries/get-my-pair-games.query';
import { GetPairGameByIdQuery } from '../application/queries/get-pair-game-by-id.query';
import { GetPairGameByIdParamsDto } from '../dto/get-pair-game-by-id-params.dto';
import { GetMyPairGamesQueryParamsDto, SubmitPairGameAnswerDto } from '../dto/pair-game.dto';
import {
  ApiConnectPairGame,
  ApiGetMyCurrentPairGame,
  ApiGetMyPairGames,
  ApiGetPairGameById,
  ApiSubmitPairGameAnswer,
} from './pair-quiz-game.swagger.decorators';

@SkipThrottle()
@ApiTags('PairQuizGame')
@ApiBearerAuth()
@UseGuards(AccessJwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('connection')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiConnectPairGame()
  connect(@CurrentUserId() userId: string) {
    return this.commandBus.execute(new ConnectPairGameCommand(userId));
  }

  @Get('my-current')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetMyCurrentPairGame()
  getMyCurrent(@CurrentUserId() userId: string) {
    return this.queryBus.execute(new GetMyCurrentPairGameQuery(userId));
  }

  @Get('my')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetMyPairGames()
  getMy(@CurrentUserId() userId: string, @Query() query: GetMyPairGamesQueryParamsDto) {
    return this.queryBus.execute(new GetMyPairGamesQuery(userId, query));
  }

  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetPairGameById()
  async getById(@Param() params: GetPairGameByIdParamsDto, @CurrentUserId() userId: string) {
    await validateOrRejectModel(params, GetPairGameByIdParamsDto, 'PairQuizGameController.getById');
    return this.queryBus.execute(new GetPairGameByIdQuery(params.id, userId));
  }

  @Post('my-current/answers')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiSubmitPairGameAnswer()
  submitAnswer(@CurrentUserId() userId: string, @Body() body: SubmitPairGameAnswerDto) {
    return this.commandBus.execute(new SubmitPairGameAnswerCommand(userId, body));
  }
}
