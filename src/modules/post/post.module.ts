import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './models/Post.schema';
import { PostController } from './api/post.controller';
import { PostService } from './application/post.service';
import { PostRepository } from './infrastructure/post.repository';
import { PostQueryRepository } from './infrastructure/post-query.repository';
import { CommentQueryRepository } from '../comment/infrastructure/comment-query.repository';
import { CommentService } from '../comment/application/comment.service';

const schemas = [{ name: Post.name, schema: PostSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [PostController],
  providers: [
    PostService,
    CommentService,
    PostRepository,
    PostQueryRepository,
    CommentQueryRepository,
  ],
})
export class PostModule {}
