import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/core/types/common';
import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { GetQuizQuestionsQueryParamsDto } from '../../dto/quiz-question.dto';
import { QuizQuestionModel } from '../../models/quiz-question.model';
import { GetQuizQuestionsUseCase } from '../use-cases/get-quiz-questions.use-case';

export class GetQuizQuestionsQuery extends TypedQuery<Paginator<QuizQuestionModel[]>> {
  constructor(public readonly input: GetQuizQuestionsQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetQuizQuestionsQuery)
export class GetQuizQuestionsHandler implements IQueryHandler<
  GetQuizQuestionsQuery,
  Paginator<QuizQuestionModel[]>
> {
  constructor(private readonly getQuizQuestionsUseCase: GetQuizQuestionsUseCase) {}

  execute(query: GetQuizQuestionsQuery): Promise<Paginator<QuizQuestionModel[]>> {
    return this.getQuizQuestionsUseCase.execute(query.input);
  }
}
