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
} from '@nestjs/common';
import { Types } from 'mongoose';
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

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly commentService: CommentService,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPosts(@Query() query: GetPostsInputModel) {
    // const currentUserId = req?.context?.user?._id
    //   ? new Types.ObjectId(req.context.user?._id).toString()
    //   : undefined;

    const resData = await this.postQueryRepository.getPosts({
      sortBy: (query.sortBy?.toString() || 'createdAt') as SortPostsBy, // by-default createdAt
      sortDirection: (query.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query.pageNumber || 1), // by-default 1
      pageSize: +(query.pageSize || 10), // by-default 10
    });
    const { pagesCount, page, pageSize, totalCount, items } = resData || {};
    // const itemsWithCurrentUserId = items.map((item) => ({
    //   ...item,
    //   currentUserId,
    // }));
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(getMappedPostViewModel),
      // items: itemsWithCurrentUserId.map(getMappedPostViewModel),
    };
  }

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPost(@Param() params: GetPostInputModel) {
    const resData = await this.postQueryRepository.findPostById(params.id);
    // const currentUserId = req?.context?.user?._id
    //   ? new ObjectId(req.context.user?._id).toString()
    //   : undefined;

    // if (!resData) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }
    return getMappedPostViewModel({
      ...resData,
      // currentUserId,
    });
  }

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getCommentsOfPost(
    @Param() params: { postId: string },
    // TODO add type
    @Query() query: any,
  ) {
    const postId = params.postId;

    const resData = await this.commentQueryRepository.getPostComments({
      sortBy: (query.sortBy?.toString() || 'createdAt') as SortPostCommentsBy, // by-default createdAt
      sortDirection: (query.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query.pageNumber || 1), // by-default 1
      pageSize: +(query.pageSize || 10), // by-default 10
      postId,
    });

    // if (!resData) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }

    const { pagesCount, page, pageSize, totalCount, items } = resData || {};

    // const currentUserId = req?.context?.user?._id
    //   ? new ObjectId(req?.context?.user?._id)?.toString()
    //   : undefined;

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

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createPost(@Body() body: CreatePostInputModel) {
    // const currentUserId = req.context?.user?._id
    //   ? new ObjectId(req.context.user._id).toString()
    //   : undefined;

    const createdPost = await this.postService.createPost(body);

    // Если указан невалидный blogId
    // if (!createdPost) {
    //   res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
    //   return;
    // }
    return createdPost;
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createCommentInPost(
    @Param() params: { postId: string },
    @Body() body: CreateCommentInputModel,
  ) {
    // if (!req.context.user) {
    //   res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    //   return;
    // }

    // const currentUserId = req.context.user._id.toString();
    const createdCommentInPost = await this.commentService.createCommentInPost({
      postId: params.postId,
      content: body.content,
      // userId: currentUserId,
      // userLogin: req.context.user.accountData.login,
      userId: undefined,
      userLogin: undefined,
    });

    // Если не найден пост
    // if (!createdCommentInPost) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }

    return createdCommentInPost;
  }

  @Put()
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePost(
    @Param() params: GetPostInputModel,
    @Body() body: UpdatePostInputModel,
  ) {
    const isPostUpdated = await this.postService.updatePost({
      id: params.id,
      input: body,
    });
    // if (!isPostUpdated) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }

    return isPostUpdated;
  }

  @Put()
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePostLikeStatus(
    @Param() params: GetPostLikeStatusInputModel,
    @Body() body: UpdatePostLikeStatusInputModel,
  ) {
    // const userId = new ObjectId(req.context.user!._id).toString();
    // const userLogin = req.context.user!.accountData.login;

    const isPostUpdated = await this.postService.updatePostLikeStatus({
      postId: params.postId,
      likeStatus: body.likeStatus,
      // userId,
      // userLogin,
      userId: undefined,
      userLogin: undefined,
    });

    // if (!isPostUpdated) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }

    return isPostUpdated;
  }

  @Delete()
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deletePost(@Param() params: GetPostInputModel) {
    const resData = await this.postService.deletePostById(params.id);
    // if (!resData) {
    //   res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    //   return;
    // }
    return resData;
  }
}
