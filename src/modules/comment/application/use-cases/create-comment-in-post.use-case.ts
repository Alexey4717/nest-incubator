import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { IUseCase } from '@/shared/types/use-case';

import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';

import { CommentViewMapper } from '../../comment.view-mapper';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentModel } from '../../models/comment.model';
import { CommentViewModel } from '../../types/view-models';

export type CreateCommentInPostInput = {
  postId: string;
  userId: string;
  userLogin: string;
  content: string;
};

@Injectable()
export class CreateCommentInPostUseCase implements IUseCase<
  CreateCommentInPostInput,
  CommentViewModel | null
> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentViewMapper: CommentViewMapper,
    @Inject(forwardRef(() => PostQueryRepository))
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async execute(input: CreateCommentInPostInput): Promise<CommentViewModel | null> {
    const { postId, content, userId, userLogin } = input;

    const foundPost = await this.postQueryRepository.findPostById(postId);
    if (!foundPost) return null;

    const newComment: CommentModel = {
      id: randomUUID(),
      postId,
      content,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    const result = await this.commentRepository.createCommentInPost(newComment);
    if (!result) return null;

    return this.commentViewMapper.toCommentViewModel(newComment);
  }
}
