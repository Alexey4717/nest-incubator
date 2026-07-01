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
import { constants } from 'http2';

import { CurrentUserId } from '@/shared/decorators/param/currentUserId.decorator';

import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';
import { GetUserIdFromBearerToken } from '@/modules/auth/guards/get-userId-from-bearer-token';
import { getMappedPostViewModel } from '@/modules/post/helpers';
import { GetPostsInputModel } from '@/modules/post/models/GetPostsInputModel';

import { CreateBlogCommand } from '../application/commands/create-blog.command';
import { CreatePostInBlogCommand } from '../application/commands/create-post-in-blog.command';
import { DeleteBlogCommand } from '../application/commands/delete-blog.command';
import { UpdateBlogCommand } from '../application/commands/update-blog.command';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogPostsQuery } from '../application/queries/get-blog-posts.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { CreatePostInBlogDTO } from '../dto/create-post-in-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { getMappedBlogViewModel } from '../helpers';
import { GetBlogsInputModel } from '../models/GetBlogsInputModel';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getBlogs(@Query() query: GetBlogsInputModel) {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':blogId/posts')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPostsOfBlog(
    @Param() params: { blogId: string },
    @Query() query: GetPostsInputModel,
    @CurrentUserId() currentUserId: string | null,
  ) {
    const resData = await this.queryBus.execute(
      new GetBlogPostsQuery(params.blogId, query, currentUserId),
    );

    if (!resData) throw new NotFoundException();

    return resData;
  }

  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getBlog(@Param() params: { id: string }) {
    const resData = await this.queryBus.execute(new GetBlogByIdQuery(params.id));
    if (!resData) throw new NotFoundException();
    return resData;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createBlog(@Body() body: CreateBlogDTO) {
    const createdBlog = await this.commandBus.execute(new CreateBlogCommand(body));
    return getMappedBlogViewModel(createdBlog);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createPostInBlog(@Param() params: { blogId: string }, @Body() body: CreatePostInBlogDTO) {
    const createdPostInBlog = await this.commandBus.execute(
      new CreatePostInBlogCommand(params.blogId, body),
    );

    if (!createdPostInBlog) throw new NotFoundException();

    return getMappedPostViewModel(createdPostInBlog);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updateBlog(@Param() params: { id: string }, @Body() body: UpdateBlogDto) {
    const isBlogUpdated = await this.commandBus.execute(new UpdateBlogCommand(params.id, body));

    if (!isBlogUpdated) throw new NotFoundException();

    return isBlogUpdated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteBlog(@Param() params: { id: string }) {
    const isBlogDeleted = await this.commandBus.execute(new DeleteBlogCommand(params.id));
    if (!isBlogDeleted) throw new NotFoundException();
    return isBlogDeleted;
  }
}
