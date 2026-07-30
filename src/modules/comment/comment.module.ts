import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';
import { LikeModule } from '@/modules/like/like.module';

import { CommentController } from './api/comment.controller';
import { CreateCommentInPostHandler } from './application/commands/create-comment-in-post.command';
import { DeleteCommentHandler } from './application/commands/delete-comment.command';
import { UpdateCommentLikeStatusHandler } from './application/commands/update-comment-like-status.command';
import { UpdateCommentHandler } from './application/commands/update-comment.command';
import { GetCommentByIdHandler } from './application/queries/get-comment-by-id.query';
import { CreateCommentInPostUseCase } from './application/use-cases/create-comment-in-post.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { GetCommentByIdUseCase } from './application/use-cases/get-comment-by-id.use-case';
import { UpdateCommentLikeStatusUseCase } from './application/use-cases/update-comment-like-status.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { CommentViewMapper } from './comment.view-mapper';
import { CommentQueryRepository } from './infrastructure/comment-query.repository';
import { CommentReactionEntity } from './infrastructure/comment-reaction.entity';
import { CommentOrmEntity } from './infrastructure/comment.orm-entity';
import { CommentRepository } from './infrastructure/comment.repository';

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

@Global()
@Module({
  imports: [
    CqrsModule,
    AuthModule,
    LikeModule,
    TypeOrmModule.forFeature([CommentOrmEntity, CommentReactionEntity]),
  ],
  controllers: [CommentController],
  providers: [
    CommentRepository,
    CommentQueryRepository,
    CommentViewMapper,
    ...commentUseCases,
    ...commentCommandHandlers,
    ...commentQueryHandlers,
  ],
  exports: [CreateCommentInPostUseCase, CommentQueryRepository, CommentViewMapper],
})
export class CommentModule {}
