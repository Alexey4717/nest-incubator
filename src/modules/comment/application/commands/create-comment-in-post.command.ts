import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { CommentViewModel } from '../../types/view-models';
import { CreateCommentInPostUseCase } from '../use-cases/create-comment-in-post.use-case';

export class CreateCommentInPostCommand extends TypedCommand<CommentViewModel | null> {
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
  CommentViewModel | null
> {
  constructor(private readonly createCommentInPostUseCase: CreateCommentInPostUseCase) {}

  execute(command: CreateCommentInPostCommand): Promise<CommentViewModel | null> {
    return this.createCommentInPostUseCase.execute({
      postId: command.postId,
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
    });
  }
}
