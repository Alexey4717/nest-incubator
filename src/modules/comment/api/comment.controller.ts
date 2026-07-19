import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { constants } from 'http2';

import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';
import { resultToDomainException } from '@/core/result/result-to-domain';
import { throwIfNotFound } from '@/core/utils/throw-if-not-found';

import { AccessJwtAuthGuard } from '@/modules/auth/guards/access-jwt-auth.guard';
import { GetUserIdFromBearerToken } from '@/modules/auth/guards/get-userId-from-bearer-token';
import { LikeInputDto } from '@/modules/like/dto/like-input.dto';

import { DeleteCommentCommand } from '../application/commands/delete-comment.command';
import { UpdateCommentLikeStatusCommand } from '../application/commands/update-comment-like-status.command';
import { UpdateCommentCommand } from '../application/commands/update-comment.command';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query';
import { UpdateCommentDTO } from '../dto/update-comment.dto';
import { GetCommentInputModel } from '../models/GetCommentInputModel';
import {
  ApiDeleteComment,
  ApiGetComment,
  ApiUpdateComment,
  ApiUpdateCommentLikeStatus,
} from './comment.swagger.decorators';

@SkipThrottle()
@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(GetUserIdFromBearerToken)
  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  @ApiGetComment()
  async getComment(@Param() params: { id: string }, @CurrentUserId() currentUserId: string | null) {
    const foundComment = await this.queryBus.execute(
      new GetCommentByIdQuery(params.id, currentUserId),
    );

    return throwIfNotFound(foundComment);
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiUpdateCommentLikeStatus()
  async changeLikeStatus(
    @Param() params: GetCommentInputModel,
    @Body() body: LikeInputDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(params.commentId, userId, body.likeStatus),
    );

    resultToDomainException(result);
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':commentId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiUpdateComment()
  async updateComment(
    @Param() params: GetCommentInputModel,
    @Body() body: UpdateCommentDTO,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(params.commentId, userId, body),
    );

    resultToDomainException(result);
  }

  @UseGuards(AccessJwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  @ApiDeleteComment()
  async deleteComment(@Param() params: GetCommentInputModel, @CurrentUserId() userId: string) {
    const result = await this.commandBus.execute(
      new DeleteCommentCommand(params.commentId, userId),
    );

    resultToDomainException(result);
  }
}
