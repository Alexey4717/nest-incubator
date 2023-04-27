import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../../post/models/Post.schema';
import { Blog } from '../../blog/models/Blog.schema';
import { User } from '../../user/models/User.schema';
import { Comment } from '../../comment/models/Comment.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<Blog>,
    @InjectModel(Post.name) private PostModel: Model<Post>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
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
