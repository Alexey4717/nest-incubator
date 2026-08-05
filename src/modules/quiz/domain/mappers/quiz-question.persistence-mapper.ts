import { QuizQuestionOrmEntity } from '../../infrastructure/quiz-question.orm-entity';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';

export const QuizQuestionPersistenceMapper = {
  toDomain(raw: QuizQuestionOrmEntity): QuizQuestionEntity {
    return QuizQuestionEntity.reconstitute(raw);
  },

  toPersistence(entity: QuizQuestionEntity): QuizQuestionOrmEntity {
    const data = entity.toDb();
    const orm = new QuizQuestionOrmEntity();
    orm.publicId = data.id;
    orm.body = data.body;
    orm.correctAnswers = data.correctAnswers;
    orm.published = data.published;
    orm.createdAt = data.createdAt;
    orm.updatedAt = data.updatedAt;
    return orm;
  },
};
