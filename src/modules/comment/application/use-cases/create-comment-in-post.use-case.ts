import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { IUseCase } from '@/shared/types/use-case';

import { Post, PostDocument } from '@/modules/post/models/post.schema';

import { getMappedCommentViewModel } from '../../helpers';
import { CommentRepository } from '../../infrastructure/comment.repository.mongodb';
import { TCommentDb } from '../../models/GetCommentOutputModel';
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
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async execute(input: CreateCommentInPostInput): Promise<CommentViewModel | null> {
    const { postId, content, userId, userLogin } = input;

    const foundPost = await this.postModel.findOne({ id: postId });
    if (!foundPost) return null;

    const newComment: TCommentDb = {
      id: randomUUID(),
      postId,
      content,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    const result = await this.commentRepository.createCommentInPost(newComment);
    if (!result) return null;

    return getMappedCommentViewModel(newComment);
  }
}
