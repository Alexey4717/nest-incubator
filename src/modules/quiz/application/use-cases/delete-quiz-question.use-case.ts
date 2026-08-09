import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

@Injectable()
export class DeleteQuizQuestionUseCase implements IUseCase<string, ResultType<null>> {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async execute(id: string): Promise<ResultType<null>> {
    const question = await this.quizQuestionRepository.findById(id);
    if (!question) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    const deleted = await this.quizQuestionRepository.deleteById(id);
    if (!deleted) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(null);
  }
}
