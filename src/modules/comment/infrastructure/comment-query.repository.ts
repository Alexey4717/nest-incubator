import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { Paginator, SortDirections } from '@/core/types/common';

import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';
import { PostOrmEntity } from '@/modules/post/infrastructure/post.orm-entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

import {
  GetPostCommentsQueryParamsDto,
  SortPostCommentsBy,
} from '../dto/get-post-comments-query-params.dto';
import { CommentModel } from '../models/comment.model';
import { CommentRawRow, fromRaw } from './comment.mapper';
import { CommentOrmEntity } from './comment.orm-entity';

const SORT_COLUMN_MAP: Record<SortPostCommentsBy, keyof CommentOrmEntity> = {
  content: 'content',
  createdAt: 'createdAt',
};

const COMMENT_RAW_SELECT = [
  'comment.publicId as "id"',
  'post.publicId as "postId"',
  'comment.content as "content"',
  'author.publicId as "userId"',
  'comment.userLogin as "userLogin"',
  'comment.createdAt as "createdAt"',
];

const COMMENT_REACTIONS_AGG = `COALESCE(
  jsonb_agg(
    json_build_object(
      'userId', ru.public_id,
      'likeStatus', r.like_status,
      'createdAt', r.created_at
    )
  ) FILTER (WHERE r.comment_id IS NOT NULL),
  '[]'
)`;

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentsRepository: Repository<CommentOrmEntity>,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async getPostComments(
    postId: string,
    query: GetPostCommentsQueryParamsDto,
  ): Promise<Paginator<CommentModel[]> | null> {
    try {
      const { sortBy, sortDirection, pageNumber, pageSize } = query;
      const postExists = await this.postQueryRepository.postExists(postId);
      if (!postExists) return null;

      const skip = query.calculateSkip();
      const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';

      const totalCount = await this.createCommentsQueryBuilder(postId).getCount();

      const rawRows = await this.createCommentsQueryBuilder(postId)
        .leftJoin('comment.reactions', 'r')
        .leftJoin(UserOrmEntity, 'ru', 'r.user_id = ru.id')
        .select(COMMENT_RAW_SELECT)
        .addSelect(COMMENT_REACTIONS_AGG, 'reactions')
        .groupBy('comment.id')
        .addGroupBy('post.id')
        .addGroupBy('author.id')
        .orderBy(`comment.${sortColumn}`, sortDirection === SortDirections.asc ? 'ASC' : 'DESC')
        .offset(skip)
        .limit(pageSize)
        .getRawMany<CommentRawRow>();

      return PaginatedViewDto.mapToView({
        items: rawRows.map(fromRaw),
        page: pageNumber,
        size: pageSize,
        totalCount,
      });
    } catch (error) {
      console.log(`commentsQueryRepository.getPostComments error is occurred: ${error}`);
      return null;
    }
  }

  async getCommentById(id: string): Promise<CommentModel | null> {
    try {
      const raw = await this.commentsRepository
        .createQueryBuilder('comment')
        .innerJoin(PostOrmEntity, 'post', 'comment.postId = post.id')
        .innerJoin(UserOrmEntity, 'author', 'comment.userId = author.id')
        .leftJoin('comment.reactions', 'r')
        .leftJoin(UserOrmEntity, 'ru', 'r.user_id = ru.id')
        .select(COMMENT_RAW_SELECT)
        .addSelect(COMMENT_REACTIONS_AGG, 'reactions')
        .where('comment.publicId = :id', { id })
        .groupBy('comment.id')
        .addGroupBy('post.id')
        .addGroupBy('author.id')
        .getRawOne<CommentRawRow>();

      return raw ? fromRaw(raw) : null;
    } catch (error) {
      console.log(`commentsQueryRepository.getCommentById error is occurred: ${error}`);
      return null;
    }
  }

  private createCommentsQueryBuilder(postPublicId: string): SelectQueryBuilder<CommentOrmEntity> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .innerJoin(PostOrmEntity, 'post', 'comment.postId = post.id')
      .innerJoin(UserOrmEntity, 'author', 'comment.userId = author.id')
      .andWhere('post.publicId = :postId', { postId: postPublicId });
  }
}
