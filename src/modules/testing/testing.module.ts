import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './api/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';
import { Post, PostSchema } from '../post/models/Post.schema';
import { Blog, BlogSchema } from '../blog/models/Blog.schema';
import { User, UserSchema } from '../user/models/User.schema';
import { Comment, CommentSchema } from '../comment/models/Comment.schema';

const schemas = [
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: User.name, schema: UserSchema },
  { name: Comment.name, schema: CommentSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
