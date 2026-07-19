import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeletePostUseCase } from '../use-cases/delete-post.use-case';

export class DeletePostCommand extends TypedCommand<boolean> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand, boolean> {
  constructor(private readonly deletePostUseCase: DeletePostUseCase) {}

  execute(command: DeletePostCommand): Promise<boolean> {
    return this.deletePostUseCase.execute(command.id);
  }
}
