import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { CommentManageStatuses } from '../../types/types';
import { UpdateCommentUseCase } from '../use-cases/update-comment.use-case';

export class UpdateCommentCommand extends TypedCommand<CommentManageStatuses> {
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
  CommentManageStatuses
> {
  constructor(private readonly updateCommentUseCase: UpdateCommentUseCase) {}

  execute(command: UpdateCommentCommand): Promise<CommentManageStatuses> {
    return this.updateCommentUseCase.execute({
      id: command.id,
      userId: command.userId,
      input: command.input,
    });
  }
}
