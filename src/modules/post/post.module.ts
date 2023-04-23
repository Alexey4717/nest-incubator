import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './models/Post.schema';
import { PostController } from './api/post.controller';
import { PostService } from './application/post.service';
import { PostRepository } from './infrastructure/post.repository';
import { PostQueryRepository } from './infrastructure/post-query.repository';
import { CommentQueryRepository } from '../comment/infrastructure/comment-query.repository';
import { CommentService } from '../comment/application/comment.service';
import { Blog, BlogSchema } from '../blog/models/Blog.schema';
import { CommentRepository } from '../comment/infrastructure/comment.repository';

const schemas = [
  { name: Post.name, schema: PostSchema },
  { name: Blog.name, schema: BlogSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [PostController],
  providers: [
    CommentRepository,
    CommentQueryRepository,
    CommentService,
    PostService,
    PostRepository,
    PostQueryRepository,
  ],
})
export class PostModule {}
