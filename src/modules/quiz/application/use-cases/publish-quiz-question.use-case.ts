import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { PublishQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

type PublishQuizQuestionInput = {
  id: string;
  input: PublishQuizQuestionDto;
};

@Injectable()
export class PublishQuizQuestionUseCase implements IUseCase<
  PublishQuizQuestionInput,
  Notification<null>
> {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async execute({ id, input }: PublishQuizQuestionInput): Promise<Notification<null>> {
    await validateOrRejectModel(
      input,
      PublishQuizQuestionDto,
      'PublishQuizQuestionUseCase.execute',
    );

    const question = await this.quizQuestionRepository.findById(id);
    if (!question) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    try {
      question.setPublished(input.published);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }

    const saved = await this.quizQuestionRepository.save(question);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
