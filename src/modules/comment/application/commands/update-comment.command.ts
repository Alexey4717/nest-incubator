import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { UpdateCommentUseCase } from '../use-cases/update-comment.use-case';

export class UpdateCommentCommand extends TypedCommand<ResultType<null>> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly input: UpdateCommentDTO,
  ) {
    super();
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<
  UpdateCommentCommand,
  ResultType<null>
> {
  constructor(private readonly updateCommentUseCase: UpdateCommentUseCase) {}

  execute(command: UpdateCommentCommand): Promise<ResultType<null>> {
    return this.updateCommentUseCase.execute({
      id: command.id,
      userId: command.userId,
      input: command.input,
    });
  }
}
