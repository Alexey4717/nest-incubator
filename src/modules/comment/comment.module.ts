import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './models/Comment.schema';
import { CommentController } from './api/comment.controller';
import { CommentService } from './application/comment.service';
import { CommentQueryRepository } from './infrastructure/comment-query.repository';
import { CommentRepository } from './infrastructure/comment.repository';
import { Post, PostSchema } from '../post/models/Post.schema';

const schemas = [
  { name: Comment.name, schema: CommentSchema },
  { name: Post.name, schema: PostSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [CommentController],
  providers: [CommentService, CommentQueryRepository, CommentRepository],
})
export class CommentModule {}
