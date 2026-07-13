import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { constants } from 'http2';

import { CurrentUserId } from '@/shared/decorators/param/currentUserId.decorator';

import { GetUserIdFromBearerToken } from '@/modules/auth/guards/get-userId-from-bearer-token';
import { GetPostsInputModel } from '@/modules/post/models/GetPostsInputModel';

import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogPostsQuery } from '../application/queries/get-blog-posts.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetBlogsInputModel } from '../models/GetBlogsInputModel';

@Controller('blogs')
export class BlogController {
  constructor(private readonly queryBus: QueryBus) {}

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
}
