import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

import { PublishQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

type PublishQuizQuestionInput = {
  id: string;
  input: PublishQuizQuestionDto;
};

@Injectable()
export class PublishQuizQuestionUseCase implements IUseCase<
  PublishQuizQuestionInput,
  ResultType<null>
> {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async execute({ id, input }: PublishQuizQuestionInput): Promise<ResultType<null>> {
    await validateOrRejectModel(
      input,
      PublishQuizQuestionDto,
      'PublishQuizQuestionUseCase.execute',
    );

    const question = await this.quizQuestionRepository.findById(id);
    if (!question) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    try {
      question.setPublished(input.published);
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    const saved = await this.quizQuestionRepository.save(question);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(null);
  }
}
