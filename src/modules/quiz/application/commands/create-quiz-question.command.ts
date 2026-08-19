import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionModel } from '../../models/quiz-question.model';
import { CreateQuizQuestionUseCase } from '../use-cases/create-quiz-question.use-case';

export class CreateQuizQuestionCommand extends TypedCommand<Notification<QuizQuestionModel>> {
  constructor(public readonly input: CreateQuizQuestionDto) {
    super();
  }
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionHandler implements ICommandHandler<
  CreateQuizQuestionCommand,
  Notification<QuizQuestionModel>
> {
  constructor(private readonly createQuizQuestionUseCase: CreateQuizQuestionUseCase) {}

  execute(command: CreateQuizQuestionCommand): Promise<Notification<QuizQuestionModel>> {
    return this.createQuizQuestionUseCase.execute(command.input);
  }
}
