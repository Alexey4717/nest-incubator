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
  Inject,
  NotFoundException,
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
    private postService: PostService,
    private postQueryRepository: PostQueryRepository,
    protected commentQueryRepository: CommentQueryRepository,
    protected commentService: CommentService,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPosts(@Query() query: GetPostsInputModel) {
    // const currentUserId = req?.context?.user?._id
    //   ? new ObjectId(req.context.user?._id).toString()
    //   : undefined;

    const resData = await this.postQueryRepository.getPosts({
      sortBy: (query?.sortBy?.toString() || 'createdAt') as SortPostsBy, // by-default createdAt
      sortDirection: (query?.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query?.pageNumber || 1), // by-default 1
      pageSize: +(query?.pageSize || 10), // by-default 10
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

  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPost(@Param() params: GetPostInputModel) {
    const resData = await this.postQueryRepository.findPostById(params.id);
    // const currentUserId = req?.context?.user?._id
    //   ? new ObjectId(req.context.user?._id).toString()
    //   : undefined;

    if (!resData) throw new NotFoundException();
    return getMappedPostViewModel({
      ...resData,
      // currentUserId,
    });
  }

  @Get(':postId/comments')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getCommentsOfPost(
    @Param() params: { postId: string },
    // TODO add type
    @Query() query: any,
  ) {
    const postId = params.postId;

    const resData = await this.commentQueryRepository.getPostComments({
      sortBy: (query?.sortBy?.toString() || 'createdAt') as SortPostCommentsBy, // by-default createdAt
      sortDirection: (query?.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query?.pageNumber || 1), // by-default 1
      pageSize: +(query?.pageSize || 10), // by-default 10
      postId,
    });

    if (!resData) throw new NotFoundException();

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
    if (!createdPost) throw new NotFoundException();
    return createdPost;
  }

  @Post(':postId/comments')
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
    if (!createdCommentInPost) throw new NotFoundException();

    return createdCommentInPost;
  }

  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePost(
    @Param() params: GetPostInputModel,
    @Body() body: UpdatePostInputModel,
  ) {
    const isPostUpdated = await this.postService.updatePost({
      id: params.id,
      input: body,
    });
    if (!isPostUpdated) throw new NotFoundException();

    return isPostUpdated;
  }

  @Put(':postId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updatePostLikeStatus(
    @Param() params: GetPostLikeStatusInputModel,
    @Body() body: UpdatePostLikeStatusInputModel,
  ) {
    // const userId = new ObjectId(req.context.user!._id).toString();
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

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deletePost(@Param() params: GetPostInputModel) {
    const resData = await this.postService.deletePostById(params.id);
    if (!resData) throw new NotFoundException();
    return resData;
  }
}
