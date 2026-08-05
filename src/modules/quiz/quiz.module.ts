import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';

import { PairQuizGameController } from './api/pair-quiz-game.controller';
import { SaQuizQuestionsController } from './api/sa-quiz-questions.controller';
import { ConnectPairGameHandler } from './application/commands/connect-pair-game.command';
import { CreateQuizQuestionHandler } from './application/commands/create-quiz-question.command';
import { DeleteQuizQuestionHandler } from './application/commands/delete-quiz-question.command';
import { PublishQuizQuestionHandler } from './application/commands/publish-quiz-question.command';
import { SubmitPairGameAnswerHandler } from './application/commands/submit-pair-game-answer.command';
import { UpdateQuizQuestionHandler } from './application/commands/update-quiz-question.command';
import { GetMyCurrentPairGameHandler } from './application/queries/get-my-current-pair-game.query';
import { GetPairGameByIdHandler } from './application/queries/get-pair-game-by-id.query';
import { GetQuizQuestionsHandler } from './application/queries/get-quiz-questions.query';
import { ConnectPairGameUseCase } from './application/use-cases/connect-pair-game.use-case';
import { CreateQuizQuestionUseCase } from './application/use-cases/create-quiz-question.use-case';
import { DeleteQuizQuestionUseCase } from './application/use-cases/delete-quiz-question.use-case';
import { GetMyCurrentPairGameUseCase } from './application/use-cases/get-my-current-pair-game.use-case';
import { GetPairGameByIdUseCase } from './application/use-cases/get-pair-game-by-id.use-case';
import { GetQuizQuestionsUseCase } from './application/use-cases/get-quiz-questions.use-case';
import { PublishQuizQuestionUseCase } from './application/use-cases/publish-quiz-question.use-case';
import { SubmitPairGameAnswerUseCase } from './application/use-cases/submit-pair-game-answer.use-case';
import { UpdateQuizQuestionUseCase } from './application/use-cases/update-quiz-question.use-case';
import { PairGameQueryRepository } from './infrastructure/pair-game-query.repository';
import { PairGameRepository } from './infrastructure/pair-game.repository';
import { QuizPairAnswerOrmEntity } from './infrastructure/quiz-pair-answer.orm-entity';
import { QuizPairQuestionOrmEntity } from './infrastructure/quiz-pair-question.orm-entity';
import { QuizPairOrmEntity } from './infrastructure/quiz-pair.orm-entity';
import { QuizQuestionQueryRepository } from './infrastructure/quiz-question-query.repository';
import { QuizQuestionOrmEntity } from './infrastructure/quiz-question.orm-entity';
import { QuizQuestionRepository } from './infrastructure/quiz-question.repository';

const quizUseCases = [
  GetQuizQuestionsUseCase,
  CreateQuizQuestionUseCase,
  UpdateQuizQuestionUseCase,
  PublishQuizQuestionUseCase,
  DeleteQuizQuestionUseCase,
  ConnectPairGameUseCase,
  GetMyCurrentPairGameUseCase,
  GetPairGameByIdUseCase,
  SubmitPairGameAnswerUseCase,
];

const quizCommandHandlers = [
  CreateQuizQuestionHandler,
  UpdateQuizQuestionHandler,
  PublishQuizQuestionHandler,
  DeleteQuizQuestionHandler,
  ConnectPairGameHandler,
  SubmitPairGameAnswerHandler,
];

const quizQueryHandlers = [
  GetQuizQuestionsHandler,
  GetMyCurrentPairGameHandler,
  GetPairGameByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    TypeOrmModule.forFeature([
      QuizQuestionOrmEntity,
      QuizPairOrmEntity,
      QuizPairQuestionOrmEntity,
      QuizPairAnswerOrmEntity,
    ]),
  ],
  controllers: [SaQuizQuestionsController, PairQuizGameController],
  providers: [
    QuizQuestionRepository,
    QuizQuestionQueryRepository,
    PairGameRepository,
    PairGameQueryRepository,
    ...quizUseCases,
    ...quizCommandHandlers,
    ...quizQueryHandlers,
  ],
})
export class QuizModule {}
