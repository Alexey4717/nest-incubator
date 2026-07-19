import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BlogViewDto, PaginatedBlogsViewDto } from '@/core/swagger/blog-view.dto';
import { ApiValidationError } from '@/core/swagger/decorators/common.swagger.decorators';
import { PostViewDto } from '@/core/swagger/post-view.dto';

import { CreateBlogDTO } from '../dto/create-blog.dto';
import { CreatePostInBlogDTO } from '../dto/create-post-in-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

const UNAUTHORIZED_DESCRIPTION = 'Invalid basic auth credentials';

export function ApiSaGetBlogs() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns blogs with pagination and sorting' }),
    ApiOkResponse({ type: PaginatedBlogsViewDto }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiSaCreateBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new blog' }),
    ApiBody({ type: CreateBlogDTO }),
    ApiCreatedResponse({ type: BlogViewDto }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiSaUpdateBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Update existing blog by id' }),
    ApiParam({ name: 'id', description: 'Blog id' }),
    ApiBody({ type: UpdateBlogDto }),
    ApiNoContentResponse({ description: 'Blog updated' }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Blog not found' }),
  );
}

export function ApiSaDeleteBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete blog by id' }),
    ApiParam({ name: 'id', description: 'Blog id' }),
    ApiNoContentResponse({ description: 'Blog deleted' }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Blog not found' }),
  );
}

export function ApiSaCreatePostInBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new post for specific blog' }),
    ApiParam({ name: 'blogId', description: 'Blog id' }),
    ApiBody({ type: CreatePostInBlogDTO }),
    ApiCreatedResponse({ type: PostViewDto }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Blog not found' }),
  );
}

export function ApiSaUpdatePostInBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Update post belonging to specific blog' }),
    ApiParam({ name: 'blogId', description: 'Blog id' }),
    ApiParam({ name: 'postId', description: 'Post id' }),
    ApiBody({ type: CreatePostInBlogDTO }),
    ApiNoContentResponse({ description: 'Post updated' }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Blog or post not found' }),
  );
}

export function ApiSaDeletePostInBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete post belonging to specific blog' }),
    ApiParam({ name: 'blogId', description: 'Blog id' }),
    ApiParam({ name: 'postId', description: 'Post id' }),
    ApiNoContentResponse({ description: 'Post deleted' }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
    ApiNotFoundResponse({ description: 'Blog or post not found' }),
  );
}
