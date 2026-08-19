import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { QuizQuestionEntity } from '../../domain/entities/quiz-question.entity';
import { CreateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { fromEntity } from '../../infrastructure/quiz-question.mapper';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { QuizQuestionModel } from '../../models/quiz-question.model';

@Injectable()
export class CreateQuizQuestionUseCase implements IUseCase<
  CreateQuizQuestionDto,
  Notification<QuizQuestionModel>
> {
  constructor(private readonly quizQuestionRepository: QuizQuestionRepository) {}

  async execute(input: CreateQuizQuestionDto): Promise<Notification<QuizQuestionModel>> {
    await validateOrRejectModel(input, CreateQuizQuestionDto, 'CreateQuizQuestionUseCase.execute');

    const question = QuizQuestionEntity.create({
      body: input.body,
      correctAnswers: input.correctAnswers,
    });
    const saved = await this.quizQuestionRepository.create(question);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(fromEntity(saved));
  }
}
