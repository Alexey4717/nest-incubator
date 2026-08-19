import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CommentModel } from '../../models/comment.model';
import { CreateCommentInPostUseCase } from '../use-cases/create-comment-in-post.use-case';

export class CreateCommentInPostCommand extends TypedCommand<Notification<CommentModel>> {
  constructor(
    public readonly postId: string,
    public readonly content: string,
    public readonly userId: string,
    public readonly userLogin: string,
  ) {
    super();
  }
}

@CommandHandler(CreateCommentInPostCommand)
export class CreateCommentInPostHandler implements ICommandHandler<
  CreateCommentInPostCommand,
  Notification<CommentModel>
> {
  constructor(private readonly createCommentInPostUseCase: CreateCommentInPostUseCase) {}

  execute(command: CreateCommentInPostCommand): Promise<Notification<CommentModel>> {
    return this.createCommentInPostUseCase.execute({
      postId: command.postId,
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
    });
  }
}
