import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../models/Post.schema';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { LikeStatus } from '../../../types/common';
import { TReactions } from '../models/GetPostOutputModel';
import { PostQueryRepository } from './post-query.repository';

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
    @InjectModel(Post.name) private PostModel: Model<Post>,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async createPost(newPost: any): Promise<any> {
    try {
      return await newPost.save();
      // return true;
      // const result = await postsCollection.insertOne(newPost);
      // return Boolean(result.insertedId);
    } catch (error) {
      console.log(`postsRepository.createPost error is occurred: ${error}`);
      return false;
    }
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    try {
      const response = await this.PostModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: input },
      );
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
      const filter = { _id: new Types.ObjectId(postId) };
      const foundPost = await this.postQueryRepository.findPostById(postId);

      if (!foundPost) return false;

      const foundPostLikeStatus = foundPost.reactions.find(
        (likeStatus: TReactions) => likeStatus.userId === userId,
      );

      if (!foundPostLikeStatus) {
        const newPostLikeStatus: TReactions = {
          userId,
          userLogin,
          likeStatus,
          createdAt: new Date().toISOString(),
        };

        const result = await this.PostModel.updateOne(filter, {
          $push: { reactions: newPostLikeStatus },
        });
        return result.matchedCount === 1;
      }

      if (foundPostLikeStatus.likeStatus === likeStatus) return true;

      const result = await this.PostModel.updateOne(
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
        'postsRepository.updatePostLikeStatus error is occurred: ',
        error,
      );
      return false;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.PostModel.deleteOne({
        _id: new Types.ObjectId(id),
      });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`postsRepository.deletePostById error is occurred: ${error}`);
      return false;
    }
  }
}
