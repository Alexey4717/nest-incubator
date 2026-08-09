import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { applyPagination, applySort } from '@/core/typeorm/typeorm-pagination';
import { Paginator, SortDirections } from '@/core/types/common';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';

import { AnswerStatus, PairGameStatus } from '../domain/pair-game-status.enum';
import { GetMyPairGamesQueryParamsDto, GetTopUsersQueryParamsDto } from '../dto/pair-game.dto';
import {
  parseTopUsersSort,
  TopUsersSortField,
  TopUsersSortItem,
} from '../dto/parse-top-users-sort';
import {
  AnswerInProgressView,
  PairGameViewModel,
  PlayerProgressView,
  QuestionInGameView,
  roundAvgScores,
  TopUserStatisticViewModel,
  UserStatisticViewModel,
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

type StatisticAggRow = {
  sum_score: string | null;
  games_count: string;
  wins_count: string;
  losses_count: string;
  draws_count: string;
};

type TopUserAggRow = StatisticAggRow & {
  public_id: string;
  login: string;
};

const SORT_COLUMN_MAP: Record<string, keyof QuizPairOrmEntity> = {
  pairCreatedDate: 'createdAt',
  createdAt: 'createdAt',
  status: 'status',
  startGameDate: 'startGameDate',
  finishGameDate: 'finishGameDate',
};

const TOP_USERS_ORDER_BY_EXPRESSIONS: Record<TopUsersSortField, string> = {
  avgScores: 'ROUND(s.sum_score::numeric / NULLIF(s.games_count, 0), 2)',
  sumScore: 's.sum_score',
  winsCount: 's.wins_count',
  lossesCount: 's.losses_count',
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

  async getMyGames(
    userPublicId: string,
    query: GetMyPairGamesQueryParamsDto,
  ): Promise<Paginator<PairGameViewModel[]>> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId);
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const qb = this.pairsRepository
      .createQueryBuilder('pair')
      .where('(pair.firstPlayerUserId = :userId OR pair.secondPlayerUserId = :userId)', {
        userId: userInternalId,
      });

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    applySort(qb, 'pair', sortColumn, sortDirection);
    if (sortColumn !== 'createdAt') {
      qb.addOrderBy('pair.createdAt', 'DESC');
    }
    applyPagination(qb, query.calculateSkip(), pageSize);

    const [entities, totalCount] = await qb.getManyAndCount();

    const items: PairGameViewModel[] = [];
    for (const entity of entities) {
      const view = await this.getPairGameView(entity.publicId);
      if (view) {
        items.push(view);
      }
    }

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  async getMyStatistic(userPublicId: string): Promise<UserStatisticViewModel> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId);

    const rows: StatisticAggRow[] = await this.pairsRepository.manager.query(
      `
        SELECT
          COALESCE(SUM(
            CASE
              WHEN p."first_player_user_id" = $1 THEN p."first_player_score"
              ELSE p."second_player_score"
            END
          ), 0)::text AS sum_score,
          COUNT(*)::text AS games_count,
          COUNT(*) FILTER (
            WHERE
              CASE
                WHEN p."first_player_user_id" = $1 THEN p."first_player_score"
                ELSE p."second_player_score"
              END
              >
              CASE
                WHEN p."first_player_user_id" = $1 THEN p."second_player_score"
                ELSE p."first_player_score"
              END
          )::text AS wins_count,
          COUNT(*) FILTER (
            WHERE
              CASE
                WHEN p."first_player_user_id" = $1 THEN p."first_player_score"
                ELSE p."second_player_score"
              END
              <
              CASE
                WHEN p."first_player_user_id" = $1 THEN p."second_player_score"
                ELSE p."first_player_score"
              END
          )::text AS losses_count,
          COUNT(*) FILTER (
            WHERE
              CASE
                WHEN p."first_player_user_id" = $1 THEN p."first_player_score"
                ELSE p."second_player_score"
              END
              =
              CASE
                WHEN p."first_player_user_id" = $1 THEN p."second_player_score"
                ELSE p."first_player_score"
              END
          )::text AS draws_count
        FROM "quiz_pairs" p
        WHERE p."status" = $2
          AND (p."first_player_user_id" = $1 OR p."second_player_user_id" = $1)
      `,
      [userInternalId, PairGameStatus.Finished],
    );

    const row = rows[0];
    const sumScore = Number(row?.sum_score ?? 0);
    const gamesCount = Number(row?.games_count ?? 0);

    return {
      sumScore,
      avgScores: roundAvgScores(sumScore, gamesCount),
      gamesCount,
      winsCount: Number(row?.wins_count ?? 0),
      lossesCount: Number(row?.losses_count ?? 0),
      drawsCount: Number(row?.draws_count ?? 0),
    };
  }

  async getTopUsers(
    query: GetTopUsersQueryParamsDto,
  ): Promise<Paginator<TopUserStatisticViewModel[]>> {
    const { pageNumber, pageSize } = query;
    const sortItems = parseTopUsersSort(query.sort);
    const orderBySql = this.buildTopUsersOrderBy(sortItems);

    const countRows: { total: string }[] = await this.pairsRepository.manager.query(
      `
        SELECT COUNT(*)::text AS total
        FROM (
          SELECT p."first_player_user_id" AS user_id
          FROM "quiz_pairs" p
          WHERE p."status" = $1
          UNION
          SELECT p."second_player_user_id" AS user_id
          FROM "quiz_pairs" p
          WHERE p."status" = $1
            AND p."second_player_user_id" IS NOT NULL
        ) t
      `,
      [PairGameStatus.Finished],
    );
    const totalCount = Number(countRows[0]?.total ?? 0);

    const rows: TopUserAggRow[] = await this.pairsRepository.manager.query(
      `
        WITH player_games AS (
          SELECT
            p."first_player_user_id" AS user_id,
            p."first_player_score" AS score,
            p."second_player_score" AS opponent_score
          FROM "quiz_pairs" p
          WHERE p."status" = $1
          UNION ALL
          SELECT
            p."second_player_user_id" AS user_id,
            p."second_player_score" AS score,
            p."first_player_score" AS opponent_score
          FROM "quiz_pairs" p
          WHERE p."status" = $1
            AND p."second_player_user_id" IS NOT NULL
        ),
        stats AS (
          SELECT
            pg.user_id,
            COALESCE(SUM(pg.score), 0) AS sum_score,
            COUNT(*) AS games_count,
            COUNT(*) FILTER (WHERE pg.score > pg.opponent_score) AS wins_count,
            COUNT(*) FILTER (WHERE pg.score < pg.opponent_score) AS losses_count,
            COUNT(*) FILTER (WHERE pg.score = pg.opponent_score) AS draws_count
          FROM player_games pg
          GROUP BY pg.user_id
        )
        SELECT
          u."public_id"::text AS public_id,
          u."login" AS login,
          s.sum_score::text AS sum_score,
          s.games_count::text AS games_count,
          s.wins_count::text AS wins_count,
          s.losses_count::text AS losses_count,
          s.draws_count::text AS draws_count
        FROM stats s
        INNER JOIN "users" u ON u."id" = s.user_id
        ORDER BY ${orderBySql}
        LIMIT $2 OFFSET $3
      `,
      [PairGameStatus.Finished, pageSize, query.calculateSkip()],
    );

    const items: TopUserStatisticViewModel[] = rows.map((row) => {
      const sumScore = Number(row.sum_score ?? 0);
      const gamesCount = Number(row.games_count ?? 0);

      return {
        sumScore,
        avgScores: roundAvgScores(sumScore, gamesCount),
        gamesCount,
        winsCount: Number(row.wins_count ?? 0),
        lossesCount: Number(row.losses_count ?? 0),
        drawsCount: Number(row.draws_count ?? 0),
        player: {
          id: row.public_id,
          login: row.login,
        },
      };
    });

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
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

  private buildTopUsersOrderBy(sortItems: TopUsersSortItem[]): string {
    const parts = sortItems.map((item) => {
      const expression = TOP_USERS_ORDER_BY_EXPRESSIONS[item.field];
      const direction = item.direction === SortDirections.asc ? 'ASC' : 'DESC';
      return `${expression} ${direction}`;
    });
    parts.push('u.public_id ASC');
    return parts.join(', ');
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
