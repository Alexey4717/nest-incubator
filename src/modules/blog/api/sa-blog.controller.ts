import {
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { constants } from 'http2';

import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';
import { DeletePostCommand } from '@/modules/post/application/commands/delete-post.command';
import { UpdatePostCommand } from '@/modules/post/application/commands/update-post.command';
import { PostViewMapper } from '@/modules/post/post.view-mapper';

import { CreateBlogCommand } from '../application/commands/create-blog.command';
import { CreatePostInBlogCommand } from '../application/commands/create-post-in-blog.command';
import { DeleteBlogCommand } from '../application/commands/delete-blog.command';
import { UpdateBlogCommand } from '../application/commands/update-blog.command';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { CreatePostInBlogDTO } from '../dto/create-post-in-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postViewMapper: PostViewMapper,
  ) {}

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createBlog(@Body() body: CreateBlogDTO) {
    return this.commandBus.execute(new CreateBlogCommand(body));
  }

  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updateBlog(@Param() params: { id: string }, @Body() body: UpdateBlogDto) {
    const isBlogUpdated = await this.commandBus.execute(new UpdateBlogCommand(params.id, body));

    if (!isBlogUpdated) throw new NotFoundException();
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteBlog(@Param() params: { id: string }) {
    const isBlogDeleted = await this.commandBus.execute(new DeleteBlogCommand(params.id));
    if (!isBlogDeleted) throw new NotFoundException();
  }

  @Post(':blogId/posts')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createPostInBlog(@Param() params: { blogId: string }, @Body() body: CreatePostInBlogDTO) {
    const createdPostInBlog = await this.commandBus.execute(
      new CreatePostInBlogCommand(params.blogId, body),
    );

    if (!createdPostInBlog) throw new NotFoundException();

    return this.postViewMapper.toPostViewModel(createdPostInBlog);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePost(
    @Param() params: { blogId: string; postId: string },
    @Body() body: CreatePostInBlogDTO,
  ) {
    const isPostUpdated = await this.commandBus.execute(
      new UpdatePostCommand(params.postId, { ...body, blogId: params.blogId }),
    );

    if (!isPostUpdated) throw new NotFoundException();
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deletePost(@Param() params: { blogId: string; postId: string }) {
    const isPostDeleted = await this.commandBus.execute(new DeletePostCommand(params.postId));
    if (!isPostDeleted) throw new NotFoundException();
  }
}
