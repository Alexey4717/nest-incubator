import { Injectable, Logger } from '@nestjs/common';

import { CoreConfig } from '@/core/core.config';
import { resultToDomainException } from '@/core/result/result-to-domain';

import { CreateBlogUseCase } from '@/modules/blog/application/use-cases/create-blog.use-case';
import { CreateBlogDTO } from '@/modules/blog/dto/create-blog.dto';
import { CreateCommentInPostUseCase } from '@/modules/comment/application/use-cases/create-comment-in-post.use-case';
import { CreatePostUseCase } from '@/modules/post/application/use-cases/create-post.use-case';
import { PostModel } from '@/modules/post/models/post.model';
import { DeleteAllDataUseCase } from '@/modules/testing/application/use-cases/delete-all-data.use-case';
import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user.use-case';
import { CreateUserDTO } from '@/modules/user/dto/create-user.dto';

import {
  SEED_BLOGS,
  SEED_COMMENTS,
  SEED_PASSWORD,
  SEED_POSTS,
  SEED_USERS,
} from './fixtures/seed.constants';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly coreConfig: CoreConfig,
    private readonly deleteAllDataUseCase: DeleteAllDataUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly createBlogUseCase: CreateBlogUseCase,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly createCommentInPostUseCase: CreateCommentInPostUseCase,
  ) {}

  async run(): Promise<void> {
    if (!this.coreConfig.isDevelopment) {
      throw new Error('Seed is only allowed when NODE_ENV=development');
    }

    this.logger.log('Clearing existing data…');
    resultToDomainException(await this.deleteAllDataUseCase.execute());

    this.logger.log('Creating users…');
    const devUser = resultToDomainException(
      await this.createUserUseCase.execute(this.toCreateUserDto(SEED_USERS.dev)),
    );
    resultToDomainException(await this.registerUserUseCase.execute(SEED_USERS.pending));

    this.logger.log('Creating blog…');
    const blog = resultToDomainException(
      await this.createBlogUseCase.execute(this.toCreateBlogDto(SEED_BLOGS.main)),
    );

    this.logger.log('Creating posts…');
    const posts: PostModel[] = [];
    for (const post of SEED_POSTS) {
      const created = resultToDomainException(
        await this.createPostUseCase.execute({ ...post, blogId: blog.id }),
      );
      posts.push(created);
    }

    this.logger.log('Creating comments…');
    for (const content of SEED_COMMENTS) {
      resultToDomainException(
        await this.createCommentInPostUseCase.execute({
          postId: posts[0].id,
          userId: devUser.id,
          userLogin: devUser.login,
          content,
        }),
      );
    }

    this.logger.log('Seed completed.');
    this.logger.log(`  Login: ${SEED_USERS.dev.login} / ${SEED_PASSWORD} (confirmed)`);
    this.logger.log(`  Login: ${SEED_USERS.pending.login} / ${SEED_PASSWORD} (unconfirmed)`);
    this.logger.log(`  Blog:  ${blog.name} (${blog.id})`);
    this.logger.log(`  Posts: ${posts.length}`);
  }

  private toCreateUserDto(input: (typeof SEED_USERS)[keyof typeof SEED_USERS]): CreateUserDTO {
    return Object.assign(new CreateUserDTO(), input);
  }

  private toCreateBlogDto(input: (typeof SEED_BLOGS)[keyof typeof SEED_BLOGS]): CreateBlogDTO {
    return Object.assign(new CreateBlogDTO(), input);
  }
}
