import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

@Injectable()
export class DeleteQuizQuestionUseCase implements IUseCase<string, Notification<null>> {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async execute(id: string): Promise<Notification<null>> {
    const question = await this.quizQuestionRepository.findById(id);
    if (!question) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    const deleted = await this.quizQuestionRepository.deleteById(id);
    if (!deleted) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
