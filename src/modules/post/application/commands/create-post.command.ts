import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreatePostDto } from '../../dto/create-post.dto';
import { PostViewModel } from '../../types/view-models';
import { CreatePostUseCase } from '../use-cases/create-post.use-case';

export class CreatePostCommand extends TypedCommand<ResultType<PostViewModel>> {
  constructor(public readonly input: CreatePostDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<
  CreatePostCommand,
  ResultType<PostViewModel>
> {
  constructor(private readonly createPostUseCase: CreatePostUseCase) {}

  execute(command: CreatePostCommand): Promise<ResultType<PostViewModel>> {
    return this.createPostUseCase.executeFromDto(command.input);
  }
}
