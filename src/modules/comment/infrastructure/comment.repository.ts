import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TCommentDb, TReactions } from '../models/GetCommentOutputModel';
import { Comment, CommentDocument } from '../models/Comment.schema';
import { LikeStatus } from '../../../types/common';
import { CommentQueryRepository } from './comment-query.repository';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    private commentQueryRepository: CommentQueryRepository,
  ) {}

  async createCommentInPost(newComment: TCommentDb): Promise<boolean> {
    try {
      await this.CommentModel.create(newComment);
      return true;
      // const result = await commentsCollection.insertOne(newComment)
      // return Boolean(result.insertedId);
    } catch (error) {
      console.log(
        'commentsRepository.createCommentInPost error is occurred: ',
        error,
      );
      return false;
    }
  }

  async updateCommentById({ id, content }: any): Promise<boolean> {
    try {
      const result = await this.CommentModel.updateOne(
        { id },
        { $set: { content } },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log(
        'commentsRepository.updateCommentById error is occurred: ',
        error,
      );
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
      const foundComment = await this.commentQueryRepository.getCommentById(
        commentId,
      );

      if (!foundComment) return false;

      const foundCommentLikeStatus = foundComment.reactions.find(
        (likeStatus: TReactions) => likeStatus.userId === userId,
      );

      if (!foundCommentLikeStatus) {
        const newCommentLikeStatus: TReactions = {
          userId,
          likeStatus,
          createdAt: new Date().toISOString(),
        };

        const result = await this.CommentModel.updateOne(filter, {
          $push: { reactions: newCommentLikeStatus },
        });
        return result.matchedCount === 1;
      }

      if (foundCommentLikeStatus.likeStatus === likeStatus) return true;

      // if (foundCommentLikeStatus.likeStatus === LikeStatus.None) {
      //     const result = await CommentModel.updateOne(
      //         filter,
      //         {$pull: {reactions: {userId}}}
      //     )
      // }

      const result = await this.CommentModel.updateOne(
        { ...filter, 'reactions.userId': userId },
        {
          $set: {
            'reactions.$.likeStatus': likeStatus,
            'reactions.$.createdAt': new Date().toISOString(),
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
      console.log(
        'commentsRepository.deleteCommentById error is occurred: ',
        error,
      );
      return false;
    }
  }
}
