import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';

import { BlogController } from './api/blog.controller';
import { SaBlogController } from './api/sa-blog.controller';
import { CreateBlogHandler } from './application/commands/create-blog.command';
import { CreatePostInBlogHandler } from './application/commands/create-post-in-blog.command';
import { DeleteBlogHandler } from './application/commands/delete-blog.command';
import { UpdateBlogHandler } from './application/commands/update-blog.command';
import { GetBlogByIdHandler } from './application/queries/get-blog-by-id.query';
import { GetBlogPostsHandler } from './application/queries/get-blog-posts.query';
import { GetBlogsHandler } from './application/queries/get-blogs.query';
import { CreateBlogUseCase } from './application/use-cases/create-blog.use-case';
import { CreatePostInBlogUseCase } from './application/use-cases/create-post-in-blog.use-case';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog.use-case';
import { GetBlogByIdUseCase } from './application/use-cases/get-blog-by-id.use-case';
import { GetBlogPostsUseCase } from './application/use-cases/get-blog-posts.use-case';
import { GetBlogsUseCase } from './application/use-cases/get-blogs.use-case';
import { UpdateBlogUseCase } from './application/use-cases/update-blog.use-case';
import { BlogQueryRepository } from './infrastructure/blog-query.repository';
import { BlogOrmEntity } from './infrastructure/blog.orm-entity';
import { BlogRepository } from './infrastructure/blog.repository';

const blogUseCases = [
  GetBlogsUseCase,
  GetBlogByIdUseCase,
  GetBlogPostsUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostInBlogUseCase,
];

const blogCommandHandlers = [
  CreateBlogHandler,
  UpdateBlogHandler,
  DeleteBlogHandler,
  CreatePostInBlogHandler,
];

const blogQueryHandlers = [GetBlogsHandler, GetBlogByIdHandler, GetBlogPostsHandler];

@Global()
@Module({
  imports: [CqrsModule, AuthModule, TypeOrmModule.forFeature([BlogOrmEntity])],
  controllers: [BlogController, SaBlogController],
  providers: [
    BlogRepository,
    BlogQueryRepository,
    ...blogUseCases,
    ...blogCommandHandlers,
    ...blogQueryHandlers,
  ],
  exports: [BlogQueryRepository, CreateBlogUseCase, CreatePostInBlogUseCase],
})
export class BlogModule {}
