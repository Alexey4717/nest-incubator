import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ReactionUpdateService } from '@/modules/like/application/services/reaction-update.service';
import { LikeStatus } from '@/modules/like/types/like-status';

import { TPostDb } from '../models/GetPostOutputModel';
import { Post, PostDocument } from '../models/post.schema';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { PostQueryRepository } from './post-query.repository.mongodb';

interface UpdatePostArgs {
  id: string;
  input: UpdatePostInputModel;
}

interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    private postQueryRepository: PostQueryRepository,
    private reactionUpdateService: ReactionUpdateService,
  ) {}

  async createPost(newPost: TPostDb): Promise<TPostDb | null> {
    try {
      return await this.PostModel.create(newPost);
      // return true;
      // const result = await postsCollection.insertOne(newPost);
      // return Boolean(result.insertedId);
    } catch (error) {
      console.log(`postsRepository.createPost error is occurred: ${error}`);
      return null;
    }
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    try {
      const response = await this.PostModel.updateOne({ id }, { $set: input });
      return response.matchedCount === 1;
    } catch (error) {
      console.log(`postsRepository.updatePost error is occurred: ${error}`);
      return false;
    }
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    try {
      const filter = { id: postId };
      const foundPost = await this.postQueryRepository.findPostById(postId);

      if (!foundPost) return false;

      const plan = this.reactionUpdateService.planReactionUpdate({
        reactions: foundPost.reactions ?? [],
        userId,
        likeStatus,
        userLogin,
      });

      if (plan.action === 'noop') return true;

      if (plan.action === 'push') {
        const result = await this.PostModel.updateOne(filter, {
          $push: { reactions: plan.reaction },
        });
        return result.matchedCount === 1;
      }

      if (plan.action === 'pull') {
        const result = await this.PostModel.updateOne(filter, {
          $pull: { reactions: { userId: plan.userId } },
        });
        return result.matchedCount === 1;
      }

      const result = await this.PostModel.updateOne(
        { ...filter, 'reactions.userId': plan.userId },
        {
          $set: {
            'reactions.$.likeStatus': plan.likeStatus,
            'reactions.$.createdAt': plan.createdAt,
            'reactions.$.userLogin': userLogin,
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      console.log('postsRepository.updatePostLikeStatus error is occurred: ', error);
      return false;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.PostModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`postsRepository.deletePostById error is occurred: ${error}`);
      return false;
    }
  }
}
