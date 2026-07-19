import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteBlogUseCase } from '../use-cases/delete-blog.use-case';

export class DeleteBlogCommand extends TypedCommand<ResultType<null>> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand, ResultType<null>> {
  constructor(private readonly deleteBlogUseCase: DeleteBlogUseCase) {}

  execute(command: DeleteBlogCommand): Promise<ResultType<null>> {
    return this.deleteBlogUseCase.execute(command.id);
  }
}
