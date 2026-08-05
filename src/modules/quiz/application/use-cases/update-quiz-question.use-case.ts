import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

import { UpdateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

type UpdateQuizQuestionInput = {
  id: string;
  input: UpdateQuizQuestionDto;
};

@Injectable()
export class UpdateQuizQuestionUseCase implements IUseCase<
  UpdateQuizQuestionInput,
  ResultType<null>
> {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async execute({ id, input }: UpdateQuizQuestionInput): Promise<ResultType<null>> {
    await validateOrRejectModel(input, UpdateQuizQuestionDto, 'UpdateQuizQuestionUseCase.execute');

    const question = await this.quizQuestionRepository.findById(id);
    if (!question) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    try {
      question.update({ body: input.body, correctAnswers: input.correctAnswers });
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
