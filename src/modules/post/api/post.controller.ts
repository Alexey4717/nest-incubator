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

import { AccessJwtAuthGuard } from '@/modules/auth/guards/access-jwt-auth.guard';
import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';
import { GetUserIdFromBearerToken } from '@/modules/auth/guards/get-userId-from-bearer-token';
import { CreateCommentInPostCommand } from '@/modules/comment/application/commands/create-comment-in-post.command';
import { LikeInputDto } from '@/modules/like/dto/like-input.dto';
import { FindUserByIdUseCase } from '@/modules/user/application/use-cases/find-user-by-id.use-case';

import { CreatePostCommand } from '../application/commands/create-post.command';
import { DeletePostCommand } from '../application/commands/delete-post.command';
import { UpdatePostLikeStatusCommand } from '../application/commands/update-post-like-status.command';
import { UpdatePostCommand } from '../application/commands/update-post.command';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
import { GetPostCommentsQuery } from '../application/queries/get-post-comments.query';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { CreateCommentInPostDto } from '../dto/create-comment-in-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostInputModel } from '../models/GetPostInputModel';
import { GetPostsInputModel } from '../models/GetPostsInputModel';

@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  @UseGuards(GetUserIdFromBearerToken)
  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPosts(
    @Query() query: GetPostsInputModel,
    @CurrentUserId() currentUserId: string | null,
  ) {
    return this.queryBus.execute(new GetPostsQuery({ ...query, currentUserId }));
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPost(@Param() params: GetPostInputModel, @CurrentUserId() currentUserId: string | null) {
    const resData = await this.queryBus.execute(new GetPostByIdQuery(params.id, currentUserId));

    if (!resData) throw new NotFoundException();
    return resData;
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getCommentsOfPost(
    @Param() params: { postId: string },
    @Query() query: GetPostsInputModel,
    @CurrentUserId() currentUserId: string | null,
  ) {
    const resData = await this.queryBus.execute(
      new GetPostCommentsQuery(params.postId, query, currentUserId),
    );

    if (!resData) throw new NotFoundException();
    return resData;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createPost(@Body() body: CreatePostDto) {
    const createdPost = await this.commandBus.execute(new CreatePostCommand(body));

    if (!createdPost) throw new NotFoundException();
    return createdPost;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createCommentInPost(
    @Param() params: { postId: string },
    @Body() body: CreateCommentInPostDto,
    @CurrentUserId() userId: string,
  ) {
    const user = await this.findUserByIdUseCase.execute(userId);
    if (!user) throw new NotFoundException();

    const createdCommentInPost = await this.commandBus.execute(
      new CreateCommentInPostCommand(params.postId, body.content, userId, user.accountData.login),
    );

    if (!createdCommentInPost) throw new NotFoundException();
    return createdCommentInPost;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @Body() body: LikeInputDto,
    @CurrentUserId() userId: string,
  ) {
    const user = await this.findUserByIdUseCase.execute(userId);
    if (!user) throw new NotFoundException();

    const isPostUpdated = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(postId, userId, body.likeStatus, user.accountData.login),
    );

    if (!isPostUpdated) throw new NotFoundException();
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePost(@Param() params: GetPostInputModel, @Body() body: UpdatePostDto) {
    const isPostUpdated = await this.commandBus.execute(new UpdatePostCommand(params.id, body));
    if (!isPostUpdated) throw new NotFoundException();
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deletePost(@Param() params: GetPostInputModel) {
    const resData = await this.commandBus.execute(new DeletePostCommand(params.id));
    if (!resData) throw new NotFoundException();
  }
}
