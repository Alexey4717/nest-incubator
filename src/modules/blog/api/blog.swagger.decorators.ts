import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { BlogViewDto, PaginatedBlogsViewDto } from '@/shared/swagger/blog-view.dto';
import { PaginatedPostsViewDto } from '@/shared/swagger/post-view.dto';

export function ApiGetBlogs() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns blogs with pagination and sorting' }),
    ApiOkResponse({ type: PaginatedBlogsViewDto }),
  );
}

export function ApiGetBlogPosts() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns posts for specified blog' }),
    ApiParam({ name: 'blogId', description: 'Blog id' }),
    ApiOkResponse({ type: PaginatedPostsViewDto }),
    ApiNotFoundResponse({ description: 'Blog not found' }),
  );
}

export function ApiGetBlog() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns blog by id' }),
    ApiParam({ name: 'id', description: 'Blog id' }),
    ApiOkResponse({ type: BlogViewDto }),
    ApiNotFoundResponse({ description: 'Blog not found' }),
  );
}
