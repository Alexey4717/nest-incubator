import { QuizQuestionEntity } from '../domain/entities/quiz-question.entity';
import { QuizQuestionModel } from '../models/quiz-question.model';
import { QuizQuestionOrmEntity } from './quiz-question.orm-entity';

export function toDomain(entity: QuizQuestionOrmEntity): QuizQuestionModel {
  return {
    id: entity.publicId,
    body: entity.body,
    correctAnswers: entity.correctAnswers,
    published: entity.published,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function fromEntity(entity: QuizQuestionEntity): QuizQuestionModel {
  const data = entity.toDb();
  return {
    id: data.id,
    body: data.body,
    correctAnswers: data.correctAnswers,
    published: data.published,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
}
