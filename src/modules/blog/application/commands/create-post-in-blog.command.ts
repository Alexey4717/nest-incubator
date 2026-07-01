import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { TPostDb } from '@/modules/post/models/GetPostOutputModel';

import { CreatePostInBlogDTO } from '../../dto/create-post-in-blog.dto';
import { CreatePostInBlogUseCase } from '../use-cases/create-post-in-blog.use-case';

export class CreatePostInBlogCommand extends TypedCommand<TPostDb | null> {
  constructor(
    public readonly blogId: string,
    public readonly input: CreatePostInBlogDTO,
  ) {
    super();
  }
}

@CommandHandler(CreatePostInBlogCommand)
export class CreatePostInBlogHandler implements ICommandHandler<
  CreatePostInBlogCommand,
  TPostDb | null
> {
  constructor(private readonly createPostInBlogUseCase: CreatePostInBlogUseCase) {}

  execute(command: CreatePostInBlogCommand): Promise<TPostDb | null> {
    return this.createPostInBlogUseCase.execute({
      blogId: command.blogId,
      input: command.input,
    });
  }
}
