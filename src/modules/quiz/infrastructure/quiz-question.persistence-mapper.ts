import { QuizQuestionEntity } from '../domain/entities/quiz-question.entity';
import { QuizQuestionOrmEntity } from './quiz-question.orm-entity';

export const QuizQuestionPersistenceMapper = {
  toDomain(raw: QuizQuestionOrmEntity): QuizQuestionEntity {
    return QuizQuestionEntity.reconstitute({
      id: raw.publicId,
      body: raw.body,
      correctAnswers: raw.correctAnswers,
      published: raw.published,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
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
