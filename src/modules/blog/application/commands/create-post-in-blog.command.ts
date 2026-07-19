import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { PostModel } from '@/modules/post/models/post.model';

import { CreatePostInBlogDTO } from '../../dto/create-post-in-blog.dto';
import { CreatePostInBlogUseCase } from '../use-cases/create-post-in-blog.use-case';

export class CreatePostInBlogCommand extends TypedCommand<ResultType<PostModel>> {
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
  ResultType<PostModel>
> {
  constructor(private readonly createPostInBlogUseCase: CreatePostInBlogUseCase) {}

  execute(command: CreatePostInBlogCommand): Promise<ResultType<PostModel>> {
    return this.createPostInBlogUseCase.execute({
      blogId: command.blogId,
      input: command.input,
    });
  }
}
