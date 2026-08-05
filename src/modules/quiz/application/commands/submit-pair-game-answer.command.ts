import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { SubmitPairGameAnswerDto } from '../../dto/pair-game.dto';
import { AnswerResultViewModel } from '../../models/pair-game.model';
import { SubmitPairGameAnswerUseCase } from '../use-cases/submit-pair-game-answer.use-case';

export class SubmitPairGameAnswerCommand extends TypedCommand<AnswerResultViewModel> {
  constructor(
    public readonly userId: string,
    public readonly input: SubmitPairGameAnswerDto,
  ) {
    super();
  }
}

@CommandHandler(SubmitPairGameAnswerCommand)
export class SubmitPairGameAnswerHandler implements ICommandHandler<
  SubmitPairGameAnswerCommand,
  AnswerResultViewModel
> {
  constructor(private readonly submitPairGameAnswerUseCase: SubmitPairGameAnswerUseCase) {}

  execute(command: SubmitPairGameAnswerCommand): Promise<AnswerResultViewModel> {
    return this.submitPairGameAnswerUseCase.execute({
      userId: command.userId,
      input: command.input,
    });
  }
}
