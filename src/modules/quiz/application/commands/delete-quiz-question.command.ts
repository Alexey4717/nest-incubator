import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteQuizQuestionUseCase } from '../use-cases/delete-quiz-question.use-case';

export class DeleteQuizQuestionCommand extends TypedCommand<ResultType<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionHandler implements ICommandHandler<
  DeleteQuizQuestionCommand,
  ResultType<null>
> {
  constructor(private readonly deleteQuizQuestionUseCase: DeleteQuizQuestionUseCase) {}

  execute(command: DeleteQuizQuestionCommand): Promise<ResultType<null>> {
    return this.deleteQuizQuestionUseCase.execute(command.id);
  }
}
