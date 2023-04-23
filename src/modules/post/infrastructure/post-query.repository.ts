import { Injectable } from '@nestjs/common';
import { SortPostsBy } from '../models/GetPostsInputModel';
import {
  CommonQueryParamsTypes,
  Paginator,
  SortDirections,
} from '../../../types/common';
import { TPostDb } from '../models/GetPostOutputModel';
import { calculateAndGetSkipValue } from '../../../helpers';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../models/Post.schema';
import { Model, Types } from 'mongoose';

type GetPostsArgs = CommonQueryParamsTypes & {
  sortBy: SortPostsBy;
};

Injectable();
export class PostQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<Post>) {}

  async getPosts({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetPostsArgs): Promise<Paginator<TPostDb[]>> {
    try {
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = {};
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
      console.log(`postsQueryRepository.getPosts error is occurred: ${error}`);
      return {} as Paginator<TPostDb[]>;
    }
  }

  async findPostById(id: string): Promise<TPostDb | null> {
    try {
      const foundPost = await this.PostModel.findOne({
        _id: new Types.ObjectId(id),
      }).lean();
      return foundPost;
    } catch (error) {
      console.log(
        `postsQueryRepository.findPostById error is occurred: ${error}`,
      );
      return null;
    }
  }
}