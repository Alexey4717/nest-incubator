import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteQuizQuestionUseCase } from '../use-cases/delete-quiz-question.use-case';

export class DeleteQuizQuestionCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionHandler implements ICommandHandler<
  DeleteQuizQuestionCommand,
  Notification<null>
> {
  constructor(private readonly deleteQuizQuestionUseCase: DeleteQuizQuestionUseCase) {}

  execute(command: DeleteQuizQuestionCommand): Promise<Notification<null>> {
    return this.deleteQuizQuestionUseCase.execute(command.id);
  }
}
