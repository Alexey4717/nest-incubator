import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { DeleteBlogUseCase } from '../use-cases/delete-blog.use-case';

export class DeleteBlogCommand extends TypedCommand<boolean> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand, boolean> {
  constructor(private readonly deleteBlogUseCase: DeleteBlogUseCase) {}

  execute(command: DeleteBlogCommand): Promise<boolean> {
    return this.deleteBlogUseCase.execute(command.id);
  }
}
