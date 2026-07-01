import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthModule } from '@/modules/auth/auth.module';
import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';
import { LikeModule } from '@/modules/like/like.module';

import { CommentController } from './api/comment.controller';
import { CreateCommentInPostHandler } from './application/commands/create-comment-in-post.command';
import { DeleteCommentHandler } from './application/commands/delete-comment.command';
import { UpdateCommentLikeStatusHandler } from './application/commands/update-comment-like-status.command';
import { UpdateCommentHandler } from './application/commands/update-comment.command';
import { GetCommentByIdHandler } from './application/queries/get-comment-by-id.query';
import { CommentOwnerCheckerService } from './application/services/comment-owner-checker.service';
import { CreateCommentInPostUseCase } from './application/use-cases/create-comment-in-post.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { GetCommentByIdUseCase } from './application/use-cases/get-comment-by-id.use-case';
import { UpdateCommentLikeStatusUseCase } from './application/use-cases/update-comment-like-status.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { CommentQueryRepository } from './infrastructure/comment-query.repository.mongodb';
import { CommentRepository } from './infrastructure/comment.repository.mongodb';

const commentUseCases = [
  GetCommentByIdUseCase,
  CreateCommentInPostUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentLikeStatusUseCase,
];

const commentCommandHandlers = [
  CreateCommentInPostHandler,
  UpdateCommentHandler,
  DeleteCommentHandler,
  UpdateCommentLikeStatusHandler,
];

const commentQueryHandlers = [GetCommentByIdHandler];

@Module({
  imports: [CqrsModule, MongooseModelsModule, AuthModule, LikeModule],
  controllers: [CommentController],
  providers: [
    CommentRepository,
    CommentQueryRepository,
    CommentOwnerCheckerService,
    ...commentUseCases,
    ...commentCommandHandlers,
    ...commentQueryHandlers,
  ],
  exports: [CreateCommentInPostUseCase, CommentQueryRepository],
})
export class CommentModule {}
