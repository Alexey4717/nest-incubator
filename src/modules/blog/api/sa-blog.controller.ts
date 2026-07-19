import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';
import { DeletePostCommand } from '@/modules/post/application/commands/delete-post.command';
import { UpdatePostCommand } from '@/modules/post/application/commands/update-post.command';
import { UpdatePostDto } from '@/modules/post/dto/update-post.dto';
import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';
import { PostViewMapper } from '@/modules/post/post.view-mapper';

import { CreateBlogCommand } from '../application/commands/create-blog.command';
import { CreatePostInBlogCommand } from '../application/commands/create-post-in-blog.command';
import { DeleteBlogCommand } from '../application/commands/delete-blog.command';
import { UpdateBlogCommand } from '../application/commands/update-blog.command';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { CreatePostInBlogDTO } from '../dto/create-post-in-blog.dto';
import { GetBlogsQueryParamsDto } from '../dto/get-blogs-query-params.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {
  ApiSaCreateBlog,
  ApiSaCreatePostInBlog,
  ApiSaDeleteBlog,
  ApiSaDeletePostInBlog,
  ApiSaGetBlogs,
  ApiSaUpdateBlog,
  ApiSaUpdatePostInBlog,
} from './sa-blog.swagger.decorators';

@SkipThrottle()
@ApiTags('Blogs (Admin)')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly postViewMapper: PostViewMapper,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiSaGetBlogs()
  async getBlogs(@Query() query: GetBlogsQueryParamsDto) {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  @ApiSaCreateBlog()
  async createBlog(@Body() body: CreateBlogDTO) {
    return this.commandBus.execute(new CreateBlogCommand(body));
  }

  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaUpdateBlog()
  async updateBlog(@Param() params: { id: string }, @Body() body: UpdateBlogDto) {
    const isBlogUpdated = await this.commandBus.execute(new UpdateBlogCommand(params.id, body));

    if (!isBlogUpdated) throw new NotFoundException();
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaDeleteBlog()
  async deleteBlog(@Param() params: { id: string }) {
    const isBlogDeleted = await this.commandBus.execute(new DeleteBlogCommand(params.id));
    if (!isBlogDeleted) throw new NotFoundException();
  }

  @Post(':blogId/posts')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  @ApiSaCreatePostInBlog()
  async createPostInBlog(@Param() params: { blogId: string }, @Body() body: CreatePostInBlogDTO) {
    const createdPostInBlog = await this.commandBus.execute(
      new CreatePostInBlogCommand(params.blogId, body),
    );

    if (!createdPostInBlog) throw new NotFoundException();

    return this.postViewMapper.toPostViewModel(createdPostInBlog);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaUpdatePostInBlog()
  async updatePost(
    @Param() params: { blogId: string; postId: string },
    @Body() body: CreatePostInBlogDTO,
  ) {
    await this.ensurePostInBlog(params.blogId, params.postId);

    const input = Object.assign(new UpdatePostDto(), body, { blogId: params.blogId });
    const isPostUpdated = await this.commandBus.execute(
      new UpdatePostCommand(params.postId, input),
    );

    if (!isPostUpdated) throw new NotFoundException();
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiSaDeletePostInBlog()
  async deletePost(@Param() params: { blogId: string; postId: string }) {
    await this.ensurePostInBlog(params.blogId, params.postId);

    const isPostDeleted = await this.commandBus.execute(new DeletePostCommand(params.postId));
    if (!isPostDeleted) throw new NotFoundException();
  }

  private async ensurePostInBlog(blogId: string, postId: string): Promise<void> {
    const blog = await this.queryBus.execute(new GetBlogByIdQuery(blogId));
    if (!blog) throw new NotFoundException();

    const post = await this.postQueryRepository.findPostById(postId);
    if (!post || post.blogId !== blogId) throw new NotFoundException();
  }
}
