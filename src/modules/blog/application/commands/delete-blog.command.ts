import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteBlogUseCase } from '../use-cases/delete-blog.use-case';

export class DeleteBlogCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand, Notification<null>> {
  constructor(private readonly deleteBlogUseCase: DeleteBlogUseCase) {}

  execute(command: DeleteBlogCommand): Promise<Notification<null>> {
    return this.deleteBlogUseCase.execute(command.id);
  }
}
