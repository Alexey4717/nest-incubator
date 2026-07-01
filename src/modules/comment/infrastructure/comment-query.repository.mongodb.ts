import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { Paginator, SortDirections } from '@/shared/types/common';
import { calculateAndGetSkipValue } from '@/shared/utils/helpers';

import { Comment, CommentDocument } from '../models/comment.schema';
import { TCommentDb } from '../models/GetCommentOutputModel';
import { GetPostsInputModel } from '../models/GetPostCommentsInputModel';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async getPostComments({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    postId,
  }: GetPostsInputModel) {
    try {
      const foundPost = await this.connection.db
        .collection('posts')
        .findOne({ id: postId }, { projection: { _id: 1 } });

      if (!foundPost) return null;

      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = { postId };
      const items = await this.CommentModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await this.CommentModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items,
      };
    } catch (error) {
      console.log(`commentsQueryRepository.getPostComments error is occurred: ${error}`);
      return {} as Paginator<TCommentDb[]>;
    }
  }

  async getCommentById(id: string): Promise<TCommentDb | null> {
    try {
      return await this.CommentModel.findOne({ id }).lean();
    } catch (error) {
      console.log(`commentsQueryRepository.getCommentById error is occurred: ${error}`);
      return null;
    }
  }
}
