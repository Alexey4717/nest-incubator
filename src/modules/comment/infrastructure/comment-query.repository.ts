import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Paginator, SortDirections } from '@/shared/types/common';
import { calculateAndGetSkipValue } from '@/shared/utils/helpers';

import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';

import { CommentModel } from '../models/comment.model';
import { SortPostCommentsBy } from '../models/GetPostCommentsInputModel';
import { CommentReactionEntity } from './comment-reaction.entity';
import { CommentEntity } from './comment.entity';
import { toDomain } from './comment.mapper';

export type GetPostCommentsArgs = {
  sortBy: SortPostCommentsBy;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
  postId: string;
};

const SORT_COLUMN_MAP: Record<SortPostCommentsBy, keyof CommentEntity> = {
  content: 'content',
  createdAt: 'createdAt',
};

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(CommentReactionEntity)
    private readonly commentReactionsRepository: Repository<CommentReactionEntity>,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async getPostComments({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    postId,
  }: GetPostCommentsArgs): Promise<Paginator<CommentModel[]> | null> {
    try {
      const foundPost = await this.postQueryRepository.findPostById(postId);
      if (!foundPost) return null;

      const qb = this.commentsRepository.createQueryBuilder('comment');
      qb.andWhere('comment.postId = :postId', { postId });

      const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
      qb.orderBy(`comment.${sortColumn}`, sortDirection === SortDirections.asc ? 'ASC' : 'DESC');

      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const [entities, totalCount] = await qb.skip(skipValue).take(pageSize).getManyAndCount();
      const pagesCount = Math.ceil(totalCount / pageSize);

      const commentIds = entities.map((entity) => entity.id);
      const reactionsByCommentId = await this.loadReactionsByCommentIds(commentIds);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: entities.map((entity) =>
          toDomain(entity, reactionsByCommentId.get(entity.id) ?? []),
        ),
      };
    } catch (error) {
      console.log(`commentsQueryRepository.getPostComments error is occurred: ${error}`);
      return {} as Paginator<CommentModel[]>;
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
