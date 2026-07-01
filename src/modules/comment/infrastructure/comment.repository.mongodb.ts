import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ReactionUpdateService } from '@/modules/like/application/services/reaction-update.service';
import { LikeStatus } from '@/modules/like/types/like-status';

import { Comment, CommentDocument } from '../models/comment.schema';
import { TCommentDb } from '../models/GetCommentOutputModel';
import { CommentQueryRepository } from './comment-query.repository.mongodb';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    private commentQueryRepository: CommentQueryRepository,
    private reactionUpdateService: ReactionUpdateService,
  ) {}

  async createCommentInPost(newComment: TCommentDb): Promise<boolean> {
    try {
      await this.CommentModel.create(newComment);
      return true;
      // const result = await commentsCollection.insertOne(newComment)
      // return Boolean(result.insertedId);
    } catch (error) {
      console.log('commentsRepository.createCommentInPost error is occurred: ', error);
      return false;
    }
  }

  async updateCommentById({ id, content }: any): Promise<boolean> {
    try {
      const result = await this.CommentModel.updateOne({ id }, { $set: { content } });
      return result?.matchedCount === 1;
    } catch (error) {
      console.log('commentsRepository.updateCommentById error is occurred: ', error);
      return false;
    }
  }

  async updateCommentLikeStatusByCommentId({
    commentId,
    userId,
    likeStatus,
  }: {
    commentId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): Promise<boolean> {
    try {
      const filter = { id: commentId };
      const foundComment = await this.commentQueryRepository.getCommentById(commentId);

      if (!foundComment) return false;

      const plan = this.reactionUpdateService.planReactionUpdate({
        reactions: foundComment.reactions,
        userId,
        likeStatus,
      });

      if (plan.action === 'noop') return true;

      if (plan.action === 'push') {
        const result = await this.CommentModel.updateOne(filter, {
          $push: { reactions: plan.reaction },
        });
        return result.matchedCount === 1;
      }

      if (plan.action === 'pull') {
        const result = await this.CommentModel.updateOne(filter, {
          $pull: { reactions: { userId: plan.userId } },
        });
        return result.matchedCount === 1;
      }

      const result = await this.CommentModel.updateOne(
        { ...filter, 'reactions.userId': plan.userId },
        {
          $set: {
            'reactions.$.likeStatus': plan.likeStatus,
            'reactions.$.createdAt': plan.createdAt,
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      console.log(
        'commentsRepository.updateCommentLikeStatusByCommentId error is occurred: ',
        error,
      );
      return false;
    }
  }

  async deleteCommentById(id: string): Promise<boolean> {
    try {
      const result = await this.CommentModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (error) {
      console.log('commentsRepository.deleteCommentById error is occurred: ', error);
      return false;
    }
  }
}
