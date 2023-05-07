import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { LikeStatus } from '../../../types/common';
import {
  GetMappedCommentOutputModel,
  TCommentDb,
} from '../models/GetCommentOutputModel';
import { CommentManageStatuses } from '../types';
import { CommentQueryRepository } from '../infrastructure/comment-query.repository';
import { Post, PostDocument } from '../../post/models/Post.schema';
import { CommentRepository } from '../infrastructure/comment.repository';

interface CreateCommentInput {
  postId: string;
  userId: string;
  userLogin: string;
  content: string;
}

interface UpdateCommentArgs {
  id: string;
  content: string;
}

interface DeleteCommentArgs {
  commentId: string;
  userId: string;
}

interface UpdateCommentLikeStatusArgs {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class CommentService {
  constructor(
    private commentQueryRepository: CommentQueryRepository,
    private commentRepository: CommentRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  _mapCommentToViewType(comment: TCommentDb): GetMappedCommentOutputModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
  }

  async createCommentInPost(
    input: CreateCommentInput,
  ): Promise<GetMappedCommentOutputModel | null> {
    const { postId, content, userId, userLogin } = input;

    const foundPost = await this.PostModel.findOne({ id: postId });

    if (!foundPost) return null;

    // TODO add dto
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
    return this._mapCommentToViewType(newComment);
  }

  // async createCommentLikeStatus() {},

  async updateCommentLikeStatus({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusArgs): Promise<boolean> {
    return await this.commentRepository.updateCommentLikeStatusByCommentId({
      commentId,
      userId,
      likeStatus,
    });
  }

  // async deleteCommentLikeStatusById() {},
  //
  // async getAllLikeStatusesByCommentId() {},

  async updateCommentById({
    id,
    content,
    userId,
  }: UpdateCommentArgs & { userId: string }): Promise<CommentManageStatuses> {
    const checkingResult = await this._checkCommentByOwnerId({
      commentId: id,
      userId,
    });
    if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;
    const updateResult = await this.commentRepository.updateCommentById({
      id,
      content,
    });
    if (!updateResult) return CommentManageStatuses.NOT_FOUND;
    return CommentManageStatuses.SUCCESS;
  }

  async deleteCommentById({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<CommentManageStatuses> {
    const checkingResult = await this._checkCommentByOwnerId({
      commentId,
      userId,
    });
    if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;
    const updateResult = await this.commentRepository.deleteCommentById(
      commentId,
    );
    if (!updateResult) return CommentManageStatuses.NOT_FOUND;
    return CommentManageStatuses.SUCCESS;
  }

  async _checkCommentByOwnerId({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<CommentManageStatuses> {
    const foundComment = await this.commentQueryRepository.getCommentById(
      commentId,
    );
    if (!foundComment) return CommentManageStatuses.NOT_FOUND;
    if (foundComment.commentatorInfo.userId !== userId)
      return CommentManageStatuses.NOT_OWNER;
    return CommentManageStatuses.SUCCESS;
  }
}
