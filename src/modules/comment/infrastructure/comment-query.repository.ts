import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PaginatedViewDto } from '@/shared/dto/paginated-view.dto';
import { Paginator } from '@/shared/types/common';
import { applyPagination, applySort } from '@/shared/utils/typeorm-pagination';

import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';

import {
  GetPostCommentsQueryParamsDto,
  SortPostCommentsBy,
} from '../dto/get-post-comments-query-params.dto';
import { CommentModel } from '../models/comment.model';
import { CommentReactionEntity } from './comment-reaction.entity';
import { toDomain } from './comment.mapper';
import { CommentOrmEntity } from './comment.orm-entity';

const SORT_COLUMN_MAP: Record<SortPostCommentsBy, keyof CommentOrmEntity> = {
  content: 'content',
  createdAt: 'createdAt',
};

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentsRepository: Repository<CommentOrmEntity>,
    @InjectRepository(CommentReactionEntity)
    private readonly commentReactionsRepository: Repository<CommentReactionEntity>,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async getPostComments(
    postId: string,
    query: GetPostCommentsQueryParamsDto,
  ): Promise<Paginator<CommentModel[]> | null> {
    try {
      const { sortBy, sortDirection, pageNumber, pageSize } = query;
      const foundPost = await this.postQueryRepository.findPostById(postId);
      if (!foundPost) return null;

      const qb = this.commentsRepository.createQueryBuilder('comment');
      qb.andWhere('comment.postId = :postId', { postId });

      const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
      applySort(qb, 'comment', sortColumn, sortDirection);
      applyPagination(qb, query.calculateSkip(), pageSize);

      const [entities, totalCount] = await qb.getManyAndCount();

      const commentIds = entities.map((entity) => entity.id);
      const reactionsByCommentId = await this.loadReactionsByCommentIds(commentIds);

      return PaginatedViewDto.mapToView({
        items: entities.map((entity) =>
          toDomain(entity, reactionsByCommentId.get(entity.id) ?? []),
        ),
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
      const entity = await this.commentsRepository.findOne({ where: { id } });
      if (!entity) return null;

      const reactions = await this.commentReactionsRepository.find({ where: { commentId: id } });
      return toDomain(entity, reactions);
    } catch (error) {
      console.log(`commentsQueryRepository.getCommentById error is occurred: ${error}`);
      return null;
    }
  }

  private async loadReactionsByCommentIds(
    commentIds: string[],
  ): Promise<Map<string, CommentReactionEntity[]>> {
    const reactionsByCommentId = new Map<string, CommentReactionEntity[]>();

    if (commentIds.length === 0) {
      return reactionsByCommentId;
    }

    const reactions = await this.commentReactionsRepository.find({
      where: { commentId: In(commentIds) },
    });

    for (const reaction of reactions) {
      const existing = reactionsByCommentId.get(reaction.commentId) ?? [];
      existing.push(reaction);
      reactionsByCommentId.set(reaction.commentId, existing);
    }

    return reactionsByCommentId;
  }
}
