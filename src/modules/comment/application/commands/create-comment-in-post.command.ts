import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CommentModel } from '../../models/comment.model';
import { CreateCommentInPostUseCase } from '../use-cases/create-comment-in-post.use-case';

export class CreateCommentInPostCommand extends TypedCommand<ResultType<CommentModel>> {
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
  ResultType<CommentModel>
> {
  constructor(private readonly createCommentInPostUseCase: CreateCommentInPostUseCase) {}

  execute(command: CreateCommentInPostCommand): Promise<ResultType<CommentModel>> {
    return this.createCommentInPostUseCase.execute({
      postId: command.postId,
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
    });
  }
}
