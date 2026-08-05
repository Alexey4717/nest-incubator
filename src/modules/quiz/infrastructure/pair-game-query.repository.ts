import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';

import { AnswerStatus, PairGameStatus } from '../domain/pair-game-status.enum';
import {
  AnswerInProgressView,
  PairGameViewModel,
  PlayerProgressView,
  QuestionInGameView,
} from '../models/pair-game.model';
import { QuizPairOrmEntity } from './quiz-pair.orm-entity';

type UserRow = { public_id: string; login: string };

type AnswerRow = {
  question_public_id: string;
  is_correct: boolean;
  answered_at: Date;
  question_order: number;
  user_internal_id: string;
};

@Injectable()
export class PairGameQueryRepository {
  constructor(
    @InjectRepository(QuizPairOrmEntity)
    private readonly pairsRepository: Repository<QuizPairOrmEntity>,
    private readonly internalIdResolver: InternalIdResolver,
  ) {}

  async findCurrentPairPublicIdForUser(userPublicId: string): Promise<string | null> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId);
    const pair = await this.pairsRepository
      .createQueryBuilder('pair')
      .where('pair.status IN (:...statuses)', {
        statuses: [PairGameStatus.PendingSecondPlayer, PairGameStatus.Active],
      })
      .andWhere('(pair.first_player_user_id = :userId OR pair.second_player_user_id = :userId)', {
        userId: userInternalId,
      })
      .orderBy('pair.created_at', 'DESC')
      .getOne();

    return pair?.publicId ?? null;
  }

  async isUserParticipant(pairPublicId: string, userPublicId: string): Promise<boolean> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId);
    const pair = await this.pairsRepository.findOne({ where: { publicId: pairPublicId } });
    if (!pair) return false;

    return pair.firstPlayerUserId === userInternalId || pair.secondPlayerUserId === userInternalId;
  }

  async getPairGameView(pairPublicId: string): Promise<PairGameViewModel | null> {
    const pair = await this.pairsRepository.findOne({ where: { publicId: pairPublicId } });
    if (!pair) return null;

    const firstPlayer = await this.loadUser(pair.firstPlayerUserId);
    if (!firstPlayer) return null;

    const secondPlayer = pair.secondPlayerUserId
      ? await this.loadUser(pair.secondPlayerUserId)
      : null;

    const questions =
      pair.status === PairGameStatus.PendingSecondPlayer ? null : await this.loadQuestions(pair.id);

    const answerRows = await this.loadAnswers(pair.id);

    const firstPlayerProgress = this.buildPlayerProgress(
      firstPlayer,
      pair.firstPlayerUserId,
      pair,
      true,
      answerRows,
    );

    const secondPlayerProgress = secondPlayer
      ? this.buildPlayerProgress(secondPlayer, pair.secondPlayerUserId!, pair, false, answerRows)
      : null;

    return {
      id: pair.publicId,
      status: pair.status,
      firstPlayerProgress,
      secondPlayerProgress,
      questions,
      pairCreatedDate: pair.createdAt.toISOString(),
      startGameDate: pair.startGameDate?.toISOString() ?? null,
      finishGameDate: pair.finishGameDate?.toISOString() ?? null,
    };
  }

  private async loadUser(userInternalId: string): Promise<UserRow | null> {
    const rows: UserRow[] = await this.pairsRepository.manager.query(
      `SELECT "public_id"::text AS public_id, "login" FROM "users" WHERE "id" = $1 LIMIT 1`,
      [userInternalId],
    );
    return rows[0] ?? null;
  }

  private async loadQuestions(pairInternalId: string): Promise<QuestionInGameView[]> {
    const rows: { public_id: string; body: string }[] = await this.pairsRepository.manager.query(
      `
        SELECT q."public_id"::text AS public_id, q."body"
        FROM "quiz_pair_questions" pq
        INNER JOIN "quiz_questions" q ON q."id" = pq."question_id"
        WHERE pq."pair_id" = $1
        ORDER BY pq."order" ASC
      `,
      [pairInternalId],
    );

    return rows.map((row) => ({ id: row.public_id, body: row.body }));
  }

  private async loadAnswers(pairInternalId: string): Promise<AnswerRow[]> {
    return this.pairsRepository.manager.query(
      `
        SELECT
          q."public_id"::text AS question_public_id,
          a."is_correct",
          a."answered_at",
          pq."order" AS question_order,
          a."user_id"::text AS user_internal_id
        FROM "quiz_pair_answers" a
        INNER JOIN "quiz_questions" q ON q."id" = a."question_id"
        INNER JOIN "quiz_pair_questions" pq
          ON pq."pair_id" = a."pair_id" AND pq."question_id" = a."question_id"
        WHERE a."pair_id" = $1
        ORDER BY pq."order" ASC
      `,
      [pairInternalId],
    );
  }

  private buildPlayerProgress(
    player: UserRow,
    userInternalId: string,
    pair: QuizPairOrmEntity,
    isFirstPlayer: boolean,
    answerRows: AnswerRow[],
  ): PlayerProgressView {
    const playerAnswers = answerRows.filter((row) => row.user_internal_id === userInternalId);

    const answers: AnswerInProgressView[] = playerAnswers.map((row) => ({
      questionId: row.question_public_id,
      answerStatus: row.is_correct ? AnswerStatus.Correct : AnswerStatus.Incorrect,
      addedAt: new Date(row.answered_at).toISOString(),
    }));

    const score =
      pair.status === PairGameStatus.Finished
        ? isFirstPlayer
          ? (pair.firstPlayerScore ?? 0)
          : (pair.secondPlayerScore ?? 0)
        : playerAnswers.filter((row) => row.is_correct).length;

    return {
      player: { id: player.public_id, login: player.login },
      answers,
      score,
    };
  }
}
