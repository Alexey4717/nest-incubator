import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { PostModel } from '@/modules/post/models/post.model';

import { CreatePostInBlogDTO } from '../../dto/create-post-in-blog.dto';
import { CreatePostInBlogUseCase } from '../use-cases/create-post-in-blog.use-case';

export class CreatePostInBlogCommand extends TypedCommand<PostModel | null> {
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
  PostModel | null
> {
  constructor(private readonly createPostInBlogUseCase: CreatePostInBlogUseCase) {}

  execute(command: CreatePostInBlogCommand): Promise<PostModel | null> {
    return this.createPostInBlogUseCase.execute({
      blogId: command.blogId,
      input: command.input,
    });
  }
}
