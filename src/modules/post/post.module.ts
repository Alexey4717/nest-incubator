import { Module } from '@nestjs/common';
import { PostController } from './api/post.controller';
import { PostService } from './application/post.service';
import { PostRepository } from './infrastructure/post.repository.mongodb';
import { PostQueryRepository } from './infrastructure/post-query.repository.mongodb';
import { CommentQueryRepository } from '../comment/infrastructure/comment-query.repository.mongodb';
import { CommentService } from '../comment/application/comment.service';
import { CommentRepository } from '../comment/infrastructure/comment.repository.mongodb';
import { MongooseModelsModule } from '../database/mongoose-models.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModelsModule, AuthModule],
  controllers: [PostController],
  providers: [
    CommentRepository as any,
    CommentQueryRepository as any,
    CommentService as any,
    PostService as any,
    PostRepository as any,
    PostQueryRepository as any,
  ],
})
export class PostModule {}
