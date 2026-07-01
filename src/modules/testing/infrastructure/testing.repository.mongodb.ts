import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Blog, BlogDocument } from '@/modules/blog/models/blog.schema';
import { Comment, CommentDocument } from '@/modules/comment/models/comment.schema';
import { Post, PostDocument } from '@/modules/post/models/post.schema';
import { Session, SessionDocument } from '@/modules/session/models/session.schema';
import { User, UserDocument } from '@/modules/user/models/user.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private readonly PostModel: Model<PostDocument>,
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    @InjectModel(Session.name)
    private readonly SessionModel: Model<SessionDocument>,
    @InjectModel(Comment.name)
    private readonly CommentModel: Model<CommentDocument>,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await Promise.all([
        this.UserModel.deleteMany({}),
        this.SessionModel.deleteMany({}),
        this.BlogModel.deleteMany({}),
        this.PostModel.deleteMany({}),
        this.CommentModel.deleteMany({}),
      ]);
      return true;
    } catch (error) {
      console.log(`TestingRepository.deleteAllData error is occurred: ${error}`);
      return false;
    }
  }
}
