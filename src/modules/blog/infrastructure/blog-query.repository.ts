import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SortPostsBy } from '../../post/models/GetPostsInputModel';
import {
  CommonQueryParamsTypes,
  Paginator,
  SortDirections,
} from '../../../types/common';
import { TPostDb } from '../../post/models/GetPostOutputModel';
import { calculateAndGetSkipValue } from '../../../helpers';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../post/models/Post.schema';
import { GetBlogOutputModelFromMongoDB } from '../models/GetBlogOutputModel';
import { Blog, BlogDocument } from '../models/Blog.schema';
import { SortBlogsBy } from '../models/GetBlogsInputModel';

type GetPostsArgs = CommonQueryParamsTypes & {
  sortBy: SortPostsBy;
};

type GetPostsInBlogArgs = GetPostsArgs & {
  blogId: string;
};

type GetBlogsArgs = CommonQueryParamsTypes & {
  searchNameTerm: string | null;
  sortBy: SortBlogsBy;
};

Injectable();
export class BlogQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async getBlogs({
    searchNameTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetBlogsArgs): Promise<Paginator<GetBlogOutputModelFromMongoDB[]>> {
    try {
      const filter = searchNameTerm
        ? { name: { $regex: searchNameTerm, $options: 'i' } }
        : {};
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const items = await this.BlogModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await this.BlogModel.count(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        page: pageNumber,
        pageSize,
        totalCount,
        pagesCount,
        items,
      };
    } catch (error) {
      console.log(`BlogsQueryRepository get blogs error is occurred: ${error}`);
      return {} as Paginator<GetBlogOutputModelFromMongoDB[]>;
    }
  }

  async getPostsInBlog({
    blogId,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetPostsInBlogArgs): Promise<Paginator<TPostDb[]> | null> {
    try {
      const foundBlog = await this.BlogModel.findOne({ id: blogId }).lean();
      if (!foundBlog) return null;
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = { blogId: { $regex: blogId } };
      const items = await this.PostModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await this.PostModel.count(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        page: pageNumber,
        pageSize,
        totalCount,
        pagesCount,
        items,
      };
    } catch (error) {
      console.log(
        `BlogsQueryRepository.getPostsInBlog error is occurred: ${error}`,
      );
      return null;
    }
  }

  async findBlogById(
    id: string,
  ): Promise<GetBlogOutputModelFromMongoDB | null> {
    try {
      const foundBlog = await this.BlogModel.findOne({ id }).lean();
      return foundBlog ?? null;
    } catch (error) {
      console.log(
        `BlogsQueryRepository find blog by id error is occurred: ${error}`,
      );
      return null;
    }
  }
}
