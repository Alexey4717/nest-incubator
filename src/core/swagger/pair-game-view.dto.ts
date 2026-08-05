import { ApiProperty } from '@nestjs/swagger';

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
