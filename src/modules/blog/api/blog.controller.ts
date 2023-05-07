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
} from '@nestjs/common';
import { constants } from 'http2';
import { getMappedBlogViewModel } from '../helpers';
import { Paginator, SortDirections } from '../../../types/common';
import {
  GetPostsInputModel,
  SortPostsBy,
} from '../../post/models/GetPostsInputModel';
import { getMappedPostViewModel } from '../../post/helpers';
import { GetBlogsInputModel, SortBlogsBy } from '../models/GetBlogsInputModel';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { CreatePostInBlogInputModel } from '../models/CreatePostInBlogInputModel';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import { BlogService } from '../application/blog.service';
import { BlogQueryRepository } from '../infrastructure/blog-query.repository';

@Controller('blogs')
export class BlogController {
  constructor(
    private blogService: BlogService,
    private blogQueryRepository: BlogQueryRepository,
  ) {}

  @Get()
  @HttpCode(constants.HTTP_STATUS_OK)
  async getBlogs(@Query() query: GetBlogsInputModel) {
    const resData = await this.blogQueryRepository.getBlogs({
      searchNameTerm: query?.searchNameTerm || null, // by-default null
      sortBy: (query?.sortBy || 'createdAt') as SortBlogsBy, // by-default createdAt
      sortDirection: (query?.sortDirection ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query?.pageNumber || 1), // by-default 1,
      pageSize: +(query?.pageSize || 10), // by-default 10
    });
    const { pagesCount, page, pageSize, totalCount, items } = resData || {};
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(getMappedBlogViewModel),
    };
  }

  @Get(':id')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getBlog(@Param() params: { id: string }) {
    const resData = await this.blogQueryRepository.findBlogById(params.id);
    if (!resData) throw new NotFoundException();
    return getMappedBlogViewModel(resData);
  }

  @Get(':blogId/posts')
  @HttpCode(constants.HTTP_STATUS_OK)
  async getPostsOfBlog(
    @Param() params: { blogId: string },
    @Query() query: GetPostsInputModel,
  ) {
    // const currentUserId = req?.context?.user?.id

    const resData = await this.blogQueryRepository.getPostsInBlog({
      blogId: params?.blogId,
      sortBy: (query?.sortBy || 'createdAt') as SortPostsBy, // by-default createdAt
      sortDirection: (query?.sortDirection ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(query?.pageNumber || 1), // by-default 1
      pageSize: +(query?.pageSize || 10), // by-default 10
    });

    if (!resData) throw new NotFoundException();

    const { pagesCount, page, pageSize, totalCount, items } = resData || {};

    const itemsWithCurrentUserId = items.map((item) => ({
      ...item /* currentUserId */,
    }));

    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: itemsWithCurrentUserId.map(getMappedPostViewModel),
    };
  }

  @Post()
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createBlog(@Body() body: CreateBlogInputModel) {
    const createdBlog = await this.blogService.createBlog(body);
    return getMappedBlogViewModel(createdBlog);
  }

  @Post(':blogId/posts')
  @HttpCode(constants.HTTP_STATUS_CREATED)
  async createPostInBlog(
    @Param() params: { blogId: string },
    @Body() body: CreatePostInBlogInputModel,
  ) {
    // const currentUserId = req?.context?.user?.id

    const createdPostInBlog = await this.blogService.createPostInBlog({
      blogId: params?.blogId,
      input: body,
    });

    // Если по какой-то причине не найден блог
    if (!createdPostInBlog) throw new NotFoundException();

    return getMappedPostViewModel({
      ...createdPostInBlog,
      // currentUserId
    });
  }

  @Put(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async updateBlog(
    @Param() params: { id: string },
    @Body() body: UpdateBlogInputModel,
  ) {
    const isBlogUpdated = await this.blogService.updateBlog({
      id: params.id,
      input: body,
    });

    if (!isBlogUpdated) throw new NotFoundException();

    return isBlogUpdated;
  }

  @Delete(':id')
  @HttpCode(constants.HTTP_STATUS_NO_CONTENT)
  async deleteBlog(@Param() params: { id: string }) {
    const isBlogDeleted = await this.blogService.deleteBlogById(params.id);
    if (!isBlogDeleted) throw new NotFoundException();
    return isBlogDeleted;
  }
}

// TODO comments
// add to main module
