import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionModel } from '../../models/quiz-question.model';
import { CreateQuizQuestionUseCase } from '../use-cases/create-quiz-question.use-case';

export class CreateQuizQuestionCommand extends TypedCommand<ResultType<QuizQuestionModel>> {
  constructor(public readonly input: CreateQuizQuestionDto) {
    super();
  }
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionHandler implements ICommandHandler<
  CreateQuizQuestionCommand,
  ResultType<QuizQuestionModel>
> {
  constructor(private readonly createQuizQuestionUseCase: CreateQuizQuestionUseCase) {}

  execute(command: CreateQuizQuestionCommand): Promise<ResultType<QuizQuestionModel>> {
    return this.createQuizQuestionUseCase.execute(command.input);
  }
}
