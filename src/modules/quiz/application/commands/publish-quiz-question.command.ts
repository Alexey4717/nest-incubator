import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { PublishQuizQuestionDto } from '../../dto/quiz-question.dto';
import { PublishQuizQuestionUseCase } from '../use-cases/publish-quiz-question.use-case';

export class PublishQuizQuestionCommand extends TypedCommand<ResultType<null>> {
  constructor(
    public readonly id: string,
    public readonly input: PublishQuizQuestionDto,
  ) {
    super();
  }
}

@CommandHandler(PublishQuizQuestionCommand)
export class PublishQuizQuestionHandler implements ICommandHandler<
  PublishQuizQuestionCommand,
  ResultType<null>
> {
  constructor(private readonly publishQuizQuestionUseCase: PublishQuizQuestionUseCase) {}

  execute(command: PublishQuizQuestionCommand): Promise<ResultType<null>> {
    return this.publishQuizQuestionUseCase.execute({ id: command.id, input: command.input });
  }
}
