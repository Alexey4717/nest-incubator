import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiValidationError } from '@/core/swagger/decorators/common.swagger.decorators';

import {
  AnswerResultViewDto,
  PaginatedPairGamesViewDto,
  PaginatedTopUsersViewDto,
  PairGameViewDto,
  UserStatisticViewDto,
} from '../dto/pair-game-view.swagger.dto';
import { SubmitPairGameAnswerDto } from '../dto/pair-game.dto';

export function ApiConnectPairGame() {
  return applyDecorators(
    ApiOperation({ summary: 'Connect to pair game (matchmaking)' }),
    ApiOkResponse({ type: PairGameViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'User already in Active pair' }),
  );
}

export function ApiGetMyCurrentPairGame() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current pair game for user' }),
    ApiOkResponse({ type: PairGameViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'No active or pending pair' }),
  );
}

export function ApiGetMyPairGames() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns all my pair games with pagination' }),
    ApiOkResponse({ type: PaginatedPairGamesViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function ApiGetPairGameById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get pair game by id' }),
    ApiParam({ name: 'id', description: 'Pair game id (UUID)' }),
    ApiOkResponse({ type: PairGameViewDto }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'User is not a participant' }),
    ApiNotFoundResponse({ description: 'Pair game not found' }),
  );
}

export function ApiSubmitPairGameAnswer() {
  return applyDecorators(
    ApiOperation({ summary: 'Submit answer for current pair game' }),
    ApiBody({ type: SubmitPairGameAnswerDto }),
    ApiOkResponse({ type: AnswerResultViewDto }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Not in Active pair or all questions answered' }),
  );
}

export function ApiGetMyStatistic() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current user statistic' }),
    ApiOkResponse({ type: UserStatisticViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function ApiGetTopUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get users top by statistic' }),
    ApiOkResponse({ type: PaginatedTopUsersViewDto }),
    ApiValidationError(),
  );
}
