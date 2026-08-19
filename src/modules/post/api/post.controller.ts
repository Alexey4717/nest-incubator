import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';
import { throwIfNotFound } from '@/core/errors/throw-if-not-found';
import { notificationToDomainException } from '@/core/notification/notification-to-domain';

import { AccessJwtAuthGuard } from '@/modules/auth/guards/access-jwt-auth.guard';
import { BasicAuthGuard } from '@/modules/auth/guards/basic-auth.guard';
import { GetUserIdFromBearerToken } from '@/modules/auth/guards/get-userId-from-bearer-token';
import { CreateCommentInPostCommand } from '@/modules/comment/application/commands/create-comment-in-post.command';
import { CommentViewMapper } from '@/modules/comment/comment.view-mapper';
import { GetPostCommentsQueryParamsDto } from '@/modules/comment/dto/get-post-comments-query-params.dto';
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
import { GetPostParamsDto } from '../dto/get-post-params.dto';
import { GetPostsQueryParamsDto } from '../dto/get-posts-query-params.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import {
  ApiCreateCommentInPost,
  ApiCreatePost,
  ApiDeletePost,
  ApiGetPost,
  ApiGetPostComments,
  ApiGetPosts,
  ApiUpdatePost,
  ApiUpdatePostLikeStatus,
} from './post.swagger.decorators';

@SkipThrottle()
@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly commentViewMapper: CommentViewMapper,
  ) {}

  @UseGuards(GetUserIdFromBearerToken)
  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetPosts()
  async getPosts(
    @Query() query: GetPostsQueryParamsDto,
    @CurrentUserId() currentUserId: string | null,
  ) {
    return this.queryBus.execute(new GetPostsQuery(query, currentUserId));
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetPost()
  async getPost(@Param() params: GetPostParamsDto, @CurrentUserId() currentUserId: string | null) {
    const resData = await this.queryBus.execute(new GetPostByIdQuery(params.id, currentUserId));

    return throwIfNotFound(resData);
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetPostComments()
  async getCommentsOfPost(
    @Param() params: { postId: string },
    @Query() query: GetPostCommentsQueryParamsDto,
    @CurrentUserId() currentUserId: string | null,
  ) {
    const resData = await this.queryBus.execute(
      new GetPostCommentsQuery(params.postId, query, currentUserId),
    );

    return throwIfNotFound(resData);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  @ApiCreatePost()
  async createPost(@Body() body: CreatePostDto) {
    return notificationToDomainException(
      await this.commandBus.execute(new CreatePostCommand(body)),
    );
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  @ApiCreateCommentInPost()
  async createCommentInPost(
    @Param() params: { postId: string },
    @Body() body: CreateCommentInPostDto,
    @CurrentUserId() userId: string,
  ) {
    const user = throwIfNotFound(await this.findUserByIdUseCase.execute(userId));

    const createdComment = notificationToDomainException(
      await this.commandBus.execute(
        new CreateCommentInPostCommand(params.postId, body.content, userId, user.login),
      ),
    );

    return this.commentViewMapper.toCommentViewModel(createdComment);
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiUpdatePostLikeStatus()
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @Body() body: LikeInputDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(postId, userId, body.likeStatus),
    );

    notificationToDomainException(result);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiUpdatePost()
  async updatePost(@Param() params: GetPostParamsDto, @Body() body: UpdatePostDto) {
    const result = await this.commandBus.execute(new UpdatePostCommand(params.id, body));

    notificationToDomainException(result);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiDeletePost()
  async deletePost(@Param() params: GetPostParamsDto) {
    const result = await this.commandBus.execute(new DeletePostCommand(params.id));

    notificationToDomainException(result);
  }
}
