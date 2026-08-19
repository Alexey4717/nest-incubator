import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeletePostUseCase } from '../use-cases/delete-post.use-case';

export class DeletePostCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand, Notification<null>> {
  constructor(private readonly deletePostUseCase: DeletePostUseCase) {}

  execute(command: DeletePostCommand): Promise<Notification<null>> {
    return this.deletePostUseCase.execute(command.id);
  }
}
