import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthModule } from '@/modules/auth/auth.module';
import { LikeModule } from '@/modules/like/like.module';
import { UserModule } from '@/modules/user/user.module';

import { PostController } from './api/post.controller';
import { CreatePostHandler } from './application/commands/create-post.command';
import { DeletePostHandler } from './application/commands/delete-post.command';
import { UpdatePostLikeStatusHandler } from './application/commands/update-post-like-status.command';
import { UpdatePostHandler } from './application/commands/update-post.command';
import { GetPostByIdHandler } from './application/queries/get-post-by-id.query';
import { GetPostCommentsHandler } from './application/queries/get-post-comments.query';
import { GetPostsHandler } from './application/queries/get-posts.query';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { GetPostByIdUseCase } from './application/use-cases/get-post-by-id.use-case';
import { GetPostCommentsUseCase } from './application/use-cases/get-post-comments.use-case';
import { GetPostsUseCase } from './application/use-cases/get-posts.use-case';
import { UpdatePostLikeStatusUseCase } from './application/use-cases/update-post-like-status.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { PostQueryRepository } from './infrastructure/post-query.repository';
import { PostRepository } from './infrastructure/post.repository';
import { PostViewMapper } from './post.view-mapper';

const postUseCases = [
  GetPostsUseCase,
  GetPostByIdUseCase,
  GetPostCommentsUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
  DeletePostUseCase,
];

const postCommandHandlers = [
  CreatePostHandler,
  UpdatePostHandler,
  UpdatePostLikeStatusHandler,
  DeletePostHandler,
];

const postQueryHandlers = [GetPostsHandler, GetPostByIdHandler, GetPostCommentsHandler];

@Global()
@Module({
  imports: [CqrsModule, AuthModule, LikeModule, UserModule],
  controllers: [PostController],
  providers: [
    PostRepository,
    PostQueryRepository,
    PostViewMapper,
    ...postUseCases,
    ...postCommandHandlers,
    ...postQueryHandlers,
  ],
  exports: [CreatePostUseCase, PostRepository, PostQueryRepository, PostViewMapper],
})
export class PostModule {}
