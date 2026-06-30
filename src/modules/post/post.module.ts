import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { CommentService } from '@/modules/comment/application/comment.service';
import { CommentQueryRepository } from '@/modules/comment/infrastructure/comment-query.repository.mongodb';
import { CommentRepository } from '@/modules/comment/infrastructure/comment.repository.mongodb';
import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { PostController } from './api/post.controller';
import { PostService } from './application/post.service';
import { PostQueryRepository } from './infrastructure/post-query.repository.mongodb';
import { PostRepository } from './infrastructure/post.repository.mongodb';

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
