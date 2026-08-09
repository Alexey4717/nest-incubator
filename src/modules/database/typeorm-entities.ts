import { BlogOrmEntity } from '@/modules/blog/infrastructure/blog.orm-entity';
import { CommentReactionOrmEntity } from '@/modules/comment/infrastructure/comment-reaction.orm-entity';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/comment.orm-entity';
import { PostReactionOrmEntity } from '@/modules/post/infrastructure/post-reaction.orm-entity';
import { PostOrmEntity } from '@/modules/post/infrastructure/post.orm-entity';
import { QuizPairAnswerOrmEntity } from '@/modules/quiz/infrastructure/quiz-pair-answer.orm-entity';
import { QuizPairQuestionOrmEntity } from '@/modules/quiz/infrastructure/quiz-pair-question.orm-entity';
import { QuizPairOrmEntity } from '@/modules/quiz/infrastructure/quiz-pair.orm-entity';
import { QuizQuestionOrmEntity } from '@/modules/quiz/infrastructure/quiz-question.orm-entity';
import { SessionOrmEntity } from '@/modules/session/infrastructure/session.orm-entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

/** Список сущностей только для TypeORM CLI (data-source.ts, migration:generate). В runtime используйте TypeOrmModule.forFeature в feature-модулях + autoLoadEntities. */
export const TYPEORM_ENTITIES = [
  UserOrmEntity,
  SessionOrmEntity,
  BlogOrmEntity,
  PostOrmEntity,
  PostReactionOrmEntity,
  CommentOrmEntity,
  CommentReactionOrmEntity,
  QuizQuestionOrmEntity,
  QuizPairOrmEntity,
  QuizPairQuestionOrmEntity,
  QuizPairAnswerOrmEntity,
];
