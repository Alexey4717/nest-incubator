import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { UpdateQuizQuestionUseCase } from '../use-cases/update-quiz-question.use-case';

export class UpdateQuizQuestionCommand extends TypedCommand<ResultType<null>> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateQuizQuestionDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateQuizQuestionCommand)
export class UpdateQuizQuestionHandler implements ICommandHandler<
  UpdateQuizQuestionCommand,
  ResultType<null>
> {
  constructor(private readonly updateQuizQuestionUseCase: UpdateQuizQuestionUseCase) {}

  execute(command: UpdateQuizQuestionCommand): Promise<ResultType<null>> {
    return this.updateQuizQuestionUseCase.execute({ id: command.id, input: command.input });
  }
}
