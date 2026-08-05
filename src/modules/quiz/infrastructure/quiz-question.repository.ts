import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizQuestionEntity } from '../domain/entities/quiz-question.entity';
import { QuizQuestionPersistenceMapper } from '../domain/mappers/quiz-question.persistence-mapper';
import { QuizQuestionOrmEntity } from './quiz-question.orm-entity';

@Injectable()
export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestionOrmEntity)
    private readonly questionsRepository: Repository<QuizQuestionOrmEntity>,
  ) {}

  async create(question: QuizQuestionEntity): Promise<QuizQuestionEntity | null> {
    try {
      const entity = QuizQuestionPersistenceMapper.toPersistence(question);
      const saved = await this.questionsRepository.save(entity);
      return QuizQuestionPersistenceMapper.toDomain(saved);
    } catch (error: unknown) {
      console.log(`QuizQuestionRepository.create error: ${error}`);
      return null;
    }
  }

  async findById(id: string): Promise<QuizQuestionEntity | null> {
    const entity = await this.questionsRepository.findOne({ where: { publicId: id } });
    return entity ? QuizQuestionPersistenceMapper.toDomain(entity) : null;
  }

  async save(question: QuizQuestionEntity): Promise<boolean> {
    const data = question.toDb();
    const result = await this.questionsRepository.update(
      { publicId: data.id },
      {
        body: data.body,
        correctAnswers: data.correctAnswers,
        published: data.published,
        updatedAt: data.updatedAt,
      },
    );
    return (result.affected ?? 0) === 1;
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.questionsRepository.delete({ publicId: id });
      return (result.affected ?? 0) === 1;
    } catch (error: unknown) {
      console.log(`QuizQuestionRepository.deleteById error: ${error}`);
      return false;
    }
  }
}
