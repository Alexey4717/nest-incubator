import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import {
  ApiBearerProtected,
  ApiValidationError,
} from '@/core/swagger/decorators/common.swagger.decorators';

import { LikeInputDto } from '@/modules/like/dto/like-input.dto';

import { CommentViewDto } from '../dto/comment-view.swagger.dto';
import { UpdateCommentDTO } from '../dto/update-comment.dto';

export function ApiGetComment() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns comment by id' }),
    ApiParam({ name: 'id', description: 'Comment id' }),
    ApiOkResponse({ type: CommentViewDto }),
    ApiNotFoundResponse({ description: 'Comment not found' }),
  );
}

export function ApiUpdateCommentLikeStatus() {
  return applyDecorators(
    ApiBearerProtected(),
    ApiOperation({ summary: 'Like or dislike comment' }),
    ApiParam({ name: 'commentId', description: 'Comment id' }),
    ApiBody({ type: LikeInputDto }),
    ApiNoContentResponse({ description: 'Like status updated' }),
    ApiValidationError(),
    ApiNotFoundResponse({ description: 'Comment not found' }),
  );
}

export function ApiUpdateComment() {
  return applyDecorators(
    ApiBearerProtected(),
    ApiOperation({ summary: 'Update existing comment by id' }),
    ApiParam({ name: 'commentId', description: 'Comment id' }),
    ApiBody({ type: UpdateCommentDTO }),
    ApiNoContentResponse({ description: 'Comment updated' }),
    ApiValidationError(),
    ApiForbiddenResponse({ description: 'Not comment owner' }),
    ApiNotFoundResponse({ description: 'Comment not found' }),
  );
}

export function ApiDeleteComment() {
  return applyDecorators(
    ApiBearerProtected(),
    ApiOperation({ summary: 'Delete comment by id' }),
    ApiParam({ name: 'commentId', description: 'Comment id' }),
    ApiNoContentResponse({ description: 'Comment deleted' }),
    ApiForbiddenResponse({ description: 'Not comment owner' }),
    ApiNotFoundResponse({ description: 'Comment not found' }),
  );
}
