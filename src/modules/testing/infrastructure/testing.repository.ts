import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../post/models/Post.schema';
import { Blog, BlogDocument } from '../../blog/models/Blog.schema';
import { User, UserDocument } from '../../user/models/User.schema';
import { Comment, CommentDocument } from '../../comment/models/Comment.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await Promise.allSettled([
        this.BlogModel.deleteMany({}),
        this.PostModel.deleteMany({}),
        this.UserModel.deleteMany({}),
        this.CommentModel.deleteMany({}),
      ]);
      return true;
    } catch (error) {
      console.log(`postsRepository.createPost error is occurred: ${error}`);
      return false;
    }
  }
}
