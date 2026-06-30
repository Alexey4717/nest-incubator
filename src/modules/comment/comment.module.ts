import { Module } from '@nestjs/common';

import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { CommentController } from './api/comment.controller';
import { CommentService } from './application/comment.service';
import { CommentQueryRepository } from './infrastructure/comment-query.repository.mongodb';
import { CommentRepository } from './infrastructure/comment.repository.mongodb';

@Module({
  imports: [MongooseModelsModule],
  controllers: [CommentController],
  providers: [CommentService as any, CommentQueryRepository as any, CommentRepository as any],
})
export class CommentModule {}
