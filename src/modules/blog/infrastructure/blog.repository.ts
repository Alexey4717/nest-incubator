import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../post/models/Post.schema';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import {
  GetBlogOutputModel,
  GetBlogOutputModelFromMongoDB,
} from '../models/GetBlogOutputModel';
import { TPostDb } from '../../post/models/GetPostOutputModel';
import { ObjectId } from 'mongodb';
import { Blog, BlogDocument } from '../models/Blog.schema';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

@Injectable()
export class BlogRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async createBlog(
    newBlog: GetBlogOutputModel,
  ): Promise<GetBlogOutputModelFromMongoDB | null> {
    try {
      return await this.BlogModel.create(newBlog);
    } catch (error) {
      console.log(`blogsRepository.createBlog error is occurred: ${error}`);
      return null;
    }
  }

  async createPostInBlog(newPost: TPostDb): Promise<boolean> {
    try {
      await this.PostModel.create(newPost);
      return true;
    } catch (error) {
      console.log(
        `blogsRepository.createPostInBlog error is occurred: ${error}`,
      );
      return false;
    }
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<boolean> {
    try {
      const result = await this.BlogModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: input },
      );
      return result?.matchedCount === 1;
      // смотрим matchedCount, а не modifiedCount, т.к. при полном соответствии
      // данных mongo не производит операцию обновления и не вернет ничего
    } catch (error) {
      console.log(`blogsRepository.updateBlog error is occurred: ${error}`);
      return false;
    }
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`blogsRepository.deleteBlogById error is occurred: ${error}`);
      return false;
    }
  }
}
