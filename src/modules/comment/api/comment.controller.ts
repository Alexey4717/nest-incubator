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
import { constants } from 'http2';
import { getMappedCommentViewModel } from '../helpers';
import { LikeStatus } from '../../../types/common';
import { GetCommentInputModel } from '../models/GetCommentInputModel';
import { UpdateCommentInputModel } from '../models/UpdateCommentInputModel';
import { CommentQueryRepository } from '../infrastructure/comment-query.repository';
import { CommentService } from '../application/comment.service';
import { CommentManageStatuses } from '../types';

@Controller('comments')
export class CommentController {
  constructor(
    private commentService: CommentService,
    private commentQueryRepository: CommentQueryRepository,
  ) {}

  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getComment(@Param() params: { id: string }) {
    const foundComment = await this.commentQueryRepository.getCommentById(
      params.id,
    );

    if (!foundComment) throw new NotFoundException();

    // const currentUserId = req?.context?.user?._id ? new ObjectId(req?.context?.user?._id).toString() : undefined;
    // const foundReactionByUserId = foundComment.reactions.find((reaction) => reaction.userId === currentUserId);
    // const myStatus = foundReactionByUserId?.likeStatus ?? LikeStatus.None;

    return getMappedCommentViewModel({
      ...foundComment,
      // currentUserId
    });
  }

  @Put(':commentId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updateComment(
    @Param() params: GetCommentInputModel,
    @Body() body: UpdateCommentInputModel,
  ) {
    // if (!req.context.user) {
    //   res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
    //   return
    // }

    const result = await this.commentService.updateCommentById({
      // userId: context.user._id.toString(),
      userId: undefined,
      id: params.commentId,
      content: body.content,
    });

    // if (result === CommentManageStatuses.NOT_OWNER) {
    //   res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    //   return;
    // }
    //
    if (result === CommentManageStatuses.NOT_FOUND)
      throw new NotFoundException();

    return result;
  }

  @Delete(':commentId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteComment(@Param() params: GetCommentInputModel) {
    // if (!req.context.user) {
    //   res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
    //   return
    // }

    const result = await this.commentService.deleteCommentById({
      commentId: params.commentId,
      // userId: context.user._id.toString(),
      userId: undefined,
    });

    // if (result === CommentManageStatuses.NOT_OWNER) {
    //   res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    //   return;
    // }

    if (result === CommentManageStatuses.NOT_FOUND)
      throw new NotFoundException();

    return result;
  }

  @Put(':commentId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async changeLikeStatus(
    @Param() params: GetCommentInputModel,
    @Body() body: { likeStatus: LikeStatus },
  ) {
    // if (!req.context.user) {
    //   res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
    //   return
    // }

    const likeStatusIsUpdated =
      await this.commentService.updateCommentLikeStatus({
        commentId: params.commentId,
        // userId: context.user._id.toString(),
        userId: undefined,
        likeStatus: body.likeStatus,
      });

    if (!likeStatusIsUpdated) throw new NotFoundException();

    return likeStatusIsUpdated;
  }
}
