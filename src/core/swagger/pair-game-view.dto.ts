import { ApiProperty } from '@nestjs/swagger';

import { PaginatedMetaDto } from './paginated-meta.dto';

export class PlayerInGameViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'user1' })
  login = '';
}

export class AnswerInProgressViewDto {
  @ApiProperty({ example: 'uuid' })
  questionId = '';

  @ApiProperty({ enum: ['Correct', 'Incorrect'], example: 'Correct' })
  answerStatus = 'Correct';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  addedAt = '';
}

export class PlayerProgressViewDto {
  @ApiProperty({ type: PlayerInGameViewDto })
  player: PlayerInGameViewDto = new PlayerInGameViewDto();

  @ApiProperty({ type: [AnswerInProgressViewDto] })
  answers: AnswerInProgressViewDto[] = [];

  @ApiProperty({ example: 0 })
  score = 0;
}

export class QuestionInGameViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'What is the capital of France?' })
  body = '';
}

export class PairGameViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ enum: ['PendingSecondPlayer', 'Active', 'Finished'] })
  status = 'PendingSecondPlayer';

  @ApiProperty({ type: PlayerProgressViewDto })
  firstPlayerProgress: PlayerProgressViewDto = new PlayerProgressViewDto();

  @ApiProperty({ type: PlayerProgressViewDto, nullable: true })
  secondPlayerProgress: PlayerProgressViewDto | null = null;

  @ApiProperty({ type: [QuestionInGameViewDto], nullable: true })
  questions: QuestionInGameViewDto[] | null = null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  pairCreatedDate = '';

  @ApiProperty({ example: null, nullable: true })
  startGameDate: string | null = null;

  @ApiProperty({ example: null, nullable: true })
  finishGameDate: string | null = null;
}

export class AnswerResultViewDto {
  @ApiProperty({ example: 'uuid' })
  questionId = '';

  @ApiProperty({ enum: ['Correct', 'Incorrect'], example: 'Correct' })
  answerStatus = 'Correct';

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  addedAt = '';
}

export class PaginatedPairGamesViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [PairGameViewDto] })
  items: PairGameViewDto[] = [];
}

export class UserStatisticViewDto {
  @ApiProperty({ example: 0 })
  sumScore = 0;

  @ApiProperty({ example: 0 })
  avgScores = 0;

  @ApiProperty({ example: 0 })
  gamesCount = 0;

  @ApiProperty({ example: 0 })
  winsCount = 0;

  @ApiProperty({ example: 0 })
  lossesCount = 0;

  @ApiProperty({ example: 0 })
  drawsCount = 0;
}

export class TopUserStatisticViewDto extends UserStatisticViewDto {
  @ApiProperty({ type: PlayerInGameViewDto })
  player: PlayerInGameViewDto = new PlayerInGameViewDto();
}

export class PaginatedTopUsersViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [TopUserStatisticViewDto] })
  items: TopUserStatisticViewDto[] = [];
}
