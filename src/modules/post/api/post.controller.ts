import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { constants } from 'http2';
import { getMappedPostViewModel } from '../helpers';
import { Paginator, SortDirections } from '../../../types/common';
import { GetPostsInputModel, SortPostsBy } from '../models/GetPostsInputModel';
import { GetPostInputModel } from '../models/GetPostInputModel';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { UpdatePostLikeStatusInputModel } from '../models/UpdatePostLikeStatusInputModel';
import { GetPostLikeStatusInputModel } from '../models/GetPostLikeStatusInputModel';
import { PostQueryRepository } from '../infrastructure/post-query.repository';
import { PostService } from '../application/post.service';
import { CommentQueryRepository } from '../../comment/infrastructure/comment-query.repository';
import { SortPostCommentsBy } from '../../comment/models/GetPostCommentsInputModel';
import { CreateCommentInputModel } from '../../comment/models/CreateCommentInputModel';
import { CommentService } from '../../comment/application/comment.service';
import { getMappedCommentViewModel } from '../../comment/helpers';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreateCommentInPostDto } from '../dto/create-comment-in-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetUserIdFromBearerToken } from '../../../guards/get-userId-from-bearer-token';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { BearerAuthGuard } from '../../../guards/bearer-auth.guard';

@Controller('posts')
export class PostController {
  constructor(
    private postService: PostService,
    private postQueryRepository: PostQueryRepository,
    protected commentQueryRepository: CommentQueryRepository,
    protected commentService: CommentService,
  ) {}

  @UseGuards(GetUserIdFromBearerToken)
  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPosts(
    @Query()
    { sortBy, sortDirection, pageNumber, pageSize }: GetPostsInputModel,
  ) {
    // const currentUserId = req?.context?.user?.id;

    const resData = await this.postQueryRepository.getPosts({
      sortBy: (sortBy || 'createdAt') as SortPostsBy, // by-default createdAt
      sortDirection: (sortDirection || SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(pageNumber || 1), // by-default 1
      pageSize: +(pageSize || 10), // by-default 10
    });
    const {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items,
    } = resData || {};
    // const itemsWithCurrentUserId = items.map((item) => ({
    //   ...item,
    //   currentUserId,
    // }));
    return {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items: items.map(getMappedPostViewModel),
      // items: itemsWithCurrentUserId.map(getMappedPostViewModel),
    };
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPost(@Param() params: GetPostInputModel) {
    const resData = await this.postQueryRepository.findPostById(params.id);
    // const currentUserId = req?.context?.user?.id

    if (!resData) throw new NotFoundException();
    return getMappedPostViewModel({
      ...resData,
      // currentUserId,
    });
  }

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getCommentsOfPost(
    @Param() params: { postId: string },
    // TODO add type
    @Query() query: any,
  ) {
    const postId = params.postId;

    const resData = await this.commentQueryRepository.getPostComments({
      sortBy: (query?.sortBy || 'createdAt') as SortPostCommentsBy, // by-default createdAt
      sortDirection: (query?.sortDirection ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query?.pageNumber || 1), // by-default 1
      pageSize: +(query?.pageSize || 10), // by-default 10
      postId,
    });

    if (!resData) throw new NotFoundException();

    const { pagesCount, page, pageSize, totalCount, items } = resData || {};

    // const currentUserId = req?.context?.user?.id;

    // const itemsWithCurrentUserID = items.map((item) => ({
    //   ...item,
    //   currentUserId,
    // }));

    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      // TODO get mapper from Comment module
      items: items.map(getMappedCommentViewModel),
      // items: itemsWithCurrentUserID.map(getMappedCommentViewModel),
    };
  }

  @UseGuards(BearerAuthGuard)
  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createPost(@Body() body: CreatePostDto) {
    // const currentUserId = req.context?.user?.id;

    const createdPost = await this.postService.createPost(body);

    // Если указан невалидный blogId
    if (!createdPost) throw new NotFoundException();
    // if (!createdPost)
    //   throw new BadRequestException([
    //     {
    //       field: 'blogId',
    //       message: 'not valid blogId',
    //     },
    //   ]);
    return createdPost;
  }

  @UseGuards(BearerAuthGuard)
  @Post(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createCommentInPost(
    @Param() params: { postId: string },
    @Body() body: CreateCommentInPostDto,
  ) {
    // if (!req.context.user) {
    //   res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    //   return;
    // }

    // const currentUserId = req.context.user.id;
    const createdCommentInPost = await this.commentService.createCommentInPost({
      postId: params.postId,
      content: body.content,
      // userId: currentUserId,
      // userLogin: req.context.user.accountData.login,
      userId: undefined,
      userLogin: undefined,
    });

    // Если не найден пост
    if (!createdCommentInPost) throw new NotFoundException();

    return createdCommentInPost;
  }

  @UseGuards(BearerAuthGuard)
  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePost(
    @Param() params: GetPostInputModel,
    @Body() body: UpdatePostDto,
  ) {
    const isPostUpdated = await this.postService.updatePost({
      id: params.id,
      input: body,
    });
    if (!isPostUpdated) throw new NotFoundException();

    return isPostUpdated;
  }

  @UseGuards(BearerAuthGuard)
  @Put(':postId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePostLikeStatus(
    @Param() params: GetPostLikeStatusInputModel,
    // TODO add DTO
    @Body() body: UpdatePostLikeStatusInputModel,
  ) {
    // const userId = req.context.user!.id;
    // const userLogin = req.context.user!.accountData.login;

    const isPostUpdated = await this.postService.updatePostLikeStatus({
      postId: params.postId,
      likeStatus: body?.likeStatus,
      // userId,
      // userLogin,
      userId: undefined,
      userLogin: undefined,
    });

    if (!isPostUpdated) throw new NotFoundException();

    return isPostUpdated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deletePost(@Param() params: GetPostInputModel) {
    const resData = await this.postService.deletePostById(params.id);
    if (!resData) throw new NotFoundException();
    return resData;
  }
}
