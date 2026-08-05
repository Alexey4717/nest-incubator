import { Injectable } from '@nestjs/common';

import { Paginator } from '@/core/types/common';
import { IUseCase } from '@/core/types/use-case';

import { GetQuizQuestionsQueryParamsDto } from '../../dto/quiz-question.dto';
import { QuizQuestionQueryRepository } from '../../infrastructure/quiz-question-query.repository';
import { QuizQuestionModel } from '../../models/quiz-question.model';

@Injectable()
export class GetQuizQuestionsUseCase implements IUseCase<
  GetQuizQuestionsQueryParamsDto,
  Paginator<QuizQuestionModel[]>
> {
  constructor(private readonly quizQuestionQueryRepository: QuizQuestionQueryRepository) {}

  execute(query: GetQuizQuestionsQueryParamsDto): Promise<Paginator<QuizQuestionModel[]>> {
    return this.quizQuestionQueryRepository.getQuestions(query);
  }
}
