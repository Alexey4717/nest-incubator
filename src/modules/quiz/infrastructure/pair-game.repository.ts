import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { runWithTransactionRetry } from '@/core/database/run-with-transaction-retry';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { generatePublicId } from '@/core/id/public-id.generator';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';

import { AnswerStatus, PairGameStatus } from '../domain/pair-game-status.enum';
import {
  AnswerResultViewModel,
  calculateFinalScores,
  isAnswerCorrect,
  PAIR_GAME_QUESTIONS_COUNT,
} from '../models/pair-game.model';
import { QuizPairAnswerOrmEntity } from './quiz-pair-answer.orm-entity';
import { QuizPairQuestionOrmEntity } from './quiz-pair-question.orm-entity';
import { QuizPairOrmEntity } from './quiz-pair.orm-entity';
import { QuizQuestionOrmEntity } from './quiz-question.orm-entity';

@Injectable()
export class PairGameRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(QuizPairOrmEntity)
    private readonly pairsRepository: Repository<QuizPairOrmEntity>,
    private readonly internalIdResolver: InternalIdResolver,
  ) {}

  async findActivePairPublicIdForUser(userPublicId: string): Promise<string | null> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId);
    const pair = await this.pairsRepository
      .createQueryBuilder('pair')
      .where('pair.status = :status', { status: PairGameStatus.Active })
      .andWhere('(pair.first_player_user_id = :userId OR pair.second_player_user_id = :userId)', {
        userId: userInternalId,
      })
      .getOne();

    return pair?.publicId ?? null;
  }

  async findPendingPairAsFirstPlayerPublicId(userPublicId: string): Promise<string | null> {
    const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId);
    const pair = await this.pairsRepository.findOne({
      where: {
        status: PairGameStatus.PendingSecondPlayer,
        firstPlayerUserId: userInternalId,
      },
    });

    return pair?.publicId ?? null;
  }

  async connect(userPublicId: string): Promise<string> {
    const activePairId = await this.findActivePairPublicIdForUser(userPublicId);
    if (activePairId) {
      throw new DomainException(DomainExceptionCode.Forbidden);
    }

    const pendingAsFirst = await this.findPendingPairAsFirstPlayerPublicId(userPublicId);
    if (pendingAsFirst) {
      return pendingAsFirst;
    }

    return runWithTransactionRetry(() =>
      this.dataSource.transaction(async (manager) => {
        const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId, manager);

        const waitingPair = await manager
          .getRepository(QuizPairOrmEntity)
          .createQueryBuilder('pair')
          .setLock('pessimistic_write')
          .where('pair.status = :status', { status: PairGameStatus.PendingSecondPlayer })
          .andWhere('pair.second_player_user_id IS NULL')
          .andWhere('pair.first_player_user_id != :userId', { userId: userInternalId })
          .orderBy('pair.created_at', 'ASC')
          .getOne();

        if (waitingPair) {
          const questions = await manager
            .getRepository(QuizQuestionOrmEntity)
            .createQueryBuilder('question')
            .where('question.published = true')
            .orderBy('RANDOM()')
            .limit(PAIR_GAME_QUESTIONS_COUNT)
            .getMany();

          if (questions.length < PAIR_GAME_QUESTIONS_COUNT) {
            throw new DomainException(DomainExceptionCode.BadRequest, [
              {
                message: 'Not enough published questions to start a game',
                field: 'questions',
              },
            ]);
          }

          const now = new Date();
          waitingPair.secondPlayerUserId = userInternalId;
          waitingPair.status = PairGameStatus.Active;
          waitingPair.startGameDate = now;
          await manager.getRepository(QuizPairOrmEntity).save(waitingPair);

          await this.savePairQuestions(manager, waitingPair.id, questions);

          return waitingPair.publicId;
        }

        const newPair = manager.getRepository(QuizPairOrmEntity).create({
          publicId: generatePublicId(),
          createdAt: new Date(),
          firstPlayerUserId: userInternalId,
          secondPlayerUserId: null,
          status: PairGameStatus.PendingSecondPlayer,
          startGameDate: null,
          finishGameDate: null,
          firstPlayerScore: null,
          secondPlayerScore: null,
          firstPlayerFinishedAt: null,
          secondPlayerFinishedAt: null,
        });
        const saved = await manager.getRepository(QuizPairOrmEntity).save(newPair);
        return saved.publicId;
      }),
    );
  }

  async submitAnswer(userPublicId: string, answerText: string): Promise<AnswerResultViewModel> {
    return runWithTransactionRetry(() =>
      this.dataSource.transaction(async (manager) => {
        const userInternalId = await this.internalIdResolver.resolveUserId(userPublicId, manager);

        const pair = await manager
          .getRepository(QuizPairOrmEntity)
          .createQueryBuilder('pair')
          .setLock('pessimistic_write')
          .where('pair.status = :status', { status: PairGameStatus.Active })
          .andWhere(
            '(pair.first_player_user_id = :userId OR pair.second_player_user_id = :userId)',
            { userId: userInternalId },
          )
          .getOne();

        if (!pair) {
          throw new DomainException(DomainExceptionCode.Forbidden);
        }

        const answeredCount = await manager.getRepository(QuizPairAnswerOrmEntity).count({
          where: { pairId: pair.id, userId: userInternalId },
        });

        if (answeredCount >= PAIR_GAME_QUESTIONS_COUNT) {
          throw new DomainException(DomainExceptionCode.Forbidden);
        }

        const nextQuestion = await this.findNextQuestion(manager, pair.id, userInternalId);
        if (!nextQuestion) {
          throw new DomainException(DomainExceptionCode.Forbidden);
        }

        const question = await manager.getRepository(QuizQuestionOrmEntity).findOne({
          where: { id: nextQuestion.questionId },
        });
        if (!question) {
          throw new DomainException(DomainExceptionCode.InternalServerError);
        }

        const isCorrect = isAnswerCorrect(answerText, question.correctAnswers);
        const now = new Date();

        await manager.getRepository(QuizPairAnswerOrmEntity).save({
          pairId: pair.id,
          userId: userInternalId,
          questionId: nextQuestion.questionId,
          answer: answerText.trim(),
          isCorrect,
          answeredAt: now,
        });

        const newAnsweredCount = answeredCount + 1;
        const isFirstPlayer = pair.firstPlayerUserId === userInternalId;

        if (newAnsweredCount === PAIR_GAME_QUESTIONS_COUNT) {
          if (isFirstPlayer) {
            pair.firstPlayerFinishedAt = now;
          } else {
            pair.secondPlayerFinishedAt = now;
          }
          await manager.getRepository(QuizPairOrmEntity).save(pair);
        }

        const firstFinished = pair.firstPlayerFinishedAt !== null;
        const secondFinished = pair.secondPlayerFinishedAt !== null;

        if (firstFinished && secondFinished && pair.status === PairGameStatus.Active) {
          await this.finishGame(manager, pair);
        }

        return {
          questionId: question.publicId,
          answerStatus: isCorrect ? AnswerStatus.Correct : AnswerStatus.Incorrect,
          addedAt: now.toISOString(),
        };
      }),
    );
  }

  private async findNextQuestion(
    manager: EntityManager,
    pairInternalId: string,
    userInternalId: string,
  ): Promise<QuizPairQuestionOrmEntity | null> {
    const pairQuestions = await manager.getRepository(QuizPairQuestionOrmEntity).find({
      where: { pairId: pairInternalId },
      order: { order: 'ASC' },
    });

    const answeredQuestionIds = (
      await manager.getRepository(QuizPairAnswerOrmEntity).find({
        where: { pairId: pairInternalId, userId: userInternalId },
      })
    ).map((a) => a.questionId);

    return pairQuestions.find((pq) => !answeredQuestionIds.includes(pq.questionId)) ?? null;
  }

  private async finishGame(manager: EntityManager, pair: QuizPairOrmEntity): Promise<void> {
    const answers = await manager.getRepository(QuizPairAnswerOrmEntity).find({
      where: { pairId: pair.id },
    });

    const firstCorrect = answers.filter(
      (a) => a.userId === pair.firstPlayerUserId && a.isCorrect,
    ).length;
    const secondCorrect = answers.filter(
      (a) => a.userId === pair.secondPlayerUserId && a.isCorrect,
    ).length;

    const { firstScore, secondScore } = calculateFinalScores(
      firstCorrect,
      secondCorrect,
      pair.firstPlayerFinishedAt!,
      pair.secondPlayerFinishedAt!,
    );

    pair.firstPlayerScore = firstScore;
    pair.secondPlayerScore = secondScore;
    pair.status = PairGameStatus.Finished;
    pair.finishGameDate = new Date();

    await manager.getRepository(QuizPairOrmEntity).save(pair);
  }

  private async savePairQuestions(
    manager: EntityManager,
    pairInternalId: string,
    questions: QuizQuestionOrmEntity[],
  ): Promise<void> {
    const pairQuestionRepo = manager.getRepository(QuizPairQuestionOrmEntity);
    for (let i = 0; i < questions.length; i++) {
      await pairQuestionRepo.save({
        pairId: pairInternalId,
        questionId: questions[i].id,
        order: i + 1,
      });
    }
  }
}
