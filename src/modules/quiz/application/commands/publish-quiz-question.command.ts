import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { PublishQuizQuestionDto } from '../../dto/quiz-question.dto';
import { PublishQuizQuestionUseCase } from '../use-cases/publish-quiz-question.use-case';

export class PublishQuizQuestionCommand extends TypedCommand<Notification<null>> {
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
  Notification<null>
> {
  constructor(private readonly publishQuizQuestionUseCase: PublishQuizQuestionUseCase) {}

  execute(command: PublishQuizQuestionCommand): Promise<Notification<null>> {
    return this.publishQuizQuestionUseCase.execute({ id: command.id, input: command.input });
  }
}
