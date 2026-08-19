import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { UpdateQuizQuestionUseCase } from '../use-cases/update-quiz-question.use-case';

export class UpdateQuizQuestionCommand extends TypedCommand<Notification<null>> {
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
  Notification<null>
> {
  constructor(private readonly updateQuizQuestionUseCase: UpdateQuizQuestionUseCase) {}

  execute(command: UpdateQuizQuestionCommand): Promise<Notification<null>> {
    return this.updateQuizQuestionUseCase.execute({ id: command.id, input: command.input });
  }
}
