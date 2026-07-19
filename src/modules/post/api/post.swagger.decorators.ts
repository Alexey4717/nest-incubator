import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { CommentViewDto, PaginatedCommentsViewDto } from '@/core/swagger/comment-view.dto';
import {
  ApiBasicAdmin,
  ApiBearerProtected,
  ApiValidationError,
} from '@/core/swagger/decorators/common.swagger.decorators';
import { PaginatedPostsViewDto, PostViewDto } from '@/core/swagger/post-view.dto';

import { LikeInputDto } from '@/modules/like/dto/like-input.dto';

import { CreateCommentInPostDto } from '../dto/create-comment-in-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

export function ApiGetPosts() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns all posts with pagination and sorting' }),
    ApiOkResponse({ type: PaginatedPostsViewDto }),
  );
}

export function ApiGetPost() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns post by id' }),
    ApiParam({ name: 'id', description: 'Post id' }),
    ApiOkResponse({ type: PostViewDto }),
    ApiNotFoundResponse({ description: 'Post not found' }),
  );
}

export function ApiGetPostComments() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns comments for specified post' }),
    ApiParam({ name: 'postId', description: 'Post id' }),
    ApiOkResponse({ type: PaginatedCommentsViewDto }),
    ApiNotFoundResponse({ description: 'Post not found' }),
  );
}

export function ApiCreatePost() {
  return applyDecorators(
    ApiBasicAdmin(),
    ApiOperation({ summary: 'Create new post' }),
    ApiBody({ type: CreatePostDto }),
    ApiCreatedResponse({ type: PostViewDto }),
    ApiValidationError(),
    ApiNotFoundResponse({ description: 'Blog not found' }),
  );
}

export function ApiCreateCommentInPost() {
  return applyDecorators(
    ApiBearerProtected(),
    ApiOperation({ summary: 'Create new comment for post' }),
    ApiParam({ name: 'postId', description: 'Post id' }),
    ApiBody({ type: CreateCommentInPostDto }),
    ApiCreatedResponse({ type: CommentViewDto }),
    ApiValidationError(),
    ApiNotFoundResponse({ description: 'Post or user not found' }),
  );
}

export function ApiUpdatePostLikeStatus() {
  return applyDecorators(
    ApiBearerProtected(),
    ApiOperation({ summary: 'Like or dislike post' }),
    ApiParam({ name: 'postId', description: 'Post id' }),
    ApiBody({ type: LikeInputDto }),
    ApiNoContentResponse({ description: 'Like status updated' }),
    ApiValidationError(),
    ApiNotFoundResponse({ description: 'Post not found' }),
  );
}

export function ApiUpdatePost() {
  return applyDecorators(
    ApiBasicAdmin(),
    ApiOperation({ summary: 'Update existing post by id' }),
    ApiParam({ name: 'id', description: 'Post id' }),
    ApiBody({ type: UpdatePostDto }),
    ApiNoContentResponse({ description: 'Post updated' }),
    ApiValidationError(),
    ApiNotFoundResponse({ description: 'Post not found' }),
  );
}

export function ApiDeletePost() {
  return applyDecorators(
    ApiBasicAdmin(),
    ApiOperation({ summary: 'Delete post by id' }),
    ApiParam({ name: 'id', description: 'Post id' }),
    ApiNoContentResponse({ description: 'Post deleted' }),
    ApiNotFoundResponse({ description: 'Post not found' }),
  );
}
