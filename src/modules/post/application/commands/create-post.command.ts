import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreatePostDto } from '../../dto/create-post.dto';
import { PostViewModel } from '../../types/view-models';
import { CreatePostUseCase } from '../use-cases/create-post.use-case';

export class CreatePostCommand extends TypedCommand<Notification<PostViewModel>> {
  constructor(public readonly input: CreatePostDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<
  CreatePostCommand,
  Notification<PostViewModel>
> {
  constructor(private readonly createPostUseCase: CreatePostUseCase) {}

  execute(command: CreatePostCommand): Promise<Notification<PostViewModel>> {
    return this.createPostUseCase.executeFromDto(command.input);
  }
}
