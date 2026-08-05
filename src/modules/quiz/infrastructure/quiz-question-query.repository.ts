import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { Paginator } from '@/core/types/common';
import { applyPagination, applySort } from '@/core/utils/typeorm-pagination';

import {
  GetQuizQuestionsQueryParamsDto,
  PublishedStatusFilter,
  SortQuizQuestionsBy,
} from '../dto/quiz-question.dto';
import { QuizQuestionModel } from '../models/quiz-question.model';
import { toDomain } from './quiz-question.mapper';
import { QuizQuestionOrmEntity } from './quiz-question.orm-entity';

const SORT_COLUMN_MAP: Record<SortQuizQuestionsBy, keyof QuizQuestionOrmEntity> = {
  createdAt: 'createdAt',
};

@Injectable()
export class QuizQuestionQueryRepository {
  constructor(
    @InjectRepository(QuizQuestionOrmEntity)
    private readonly questionsRepository: Repository<QuizQuestionOrmEntity>,
  ) {}

  async getQuestions(
    query: GetQuizQuestionsQueryParamsDto,
  ): Promise<Paginator<QuizQuestionModel[]>> {
    const { bodySearchTerm, publishedStatus, sortBy, sortDirection, pageNumber, pageSize } = query;
    const qb = this.questionsRepository.createQueryBuilder('question');

    if (bodySearchTerm) {
      qb.andWhere('question.body ILIKE :bodyTerm', { bodyTerm: `%${bodySearchTerm}%` });
    }

    if (publishedStatus === PublishedStatusFilter.published) {
      qb.andWhere('question.published = true');
    } else if (publishedStatus === PublishedStatusFilter.notPublished) {
      qb.andWhere('question.published = false');
    }

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    applySort(qb, 'question', sortColumn, sortDirection);
    applyPagination(qb, query.calculateSkip(), pageSize);

    const [entities, totalCount] = await qb.getManyAndCount();

    return PaginatedViewDto.mapToView({
      items: entities.map(toDomain),
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  async findById(id: string): Promise<QuizQuestionModel | null> {
    const entity = await this.questionsRepository.findOne({ where: { publicId: id } });
    return entity ? toDomain(entity) : null;
  }

  async findRandomPublishedQuestions(limit: number): Promise<QuizQuestionModel[]> {
    const entities = await this.questionsRepository
      .createQueryBuilder('question')
      .where('question.published = true')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    return entities.map(toDomain);
  }
}
