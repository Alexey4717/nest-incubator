import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { Paginator } from '@/core/types/common';
import { applyPagination, applySort } from '@/core/utils/typeorm-pagination';

import { GetPostsQueryParamsDto, SortPostsBy } from '../dto/get-posts-query-params.dto';
import { PostModel } from '../models/post.model';
import { PostReactionEntity } from './post-reaction.entity';
import { toDomain } from './post.mapper';
import { PostOrmEntity } from './post.orm-entity';

const SORT_COLUMN_MAP: Record<SortPostsBy, keyof PostOrmEntity> = {
  title: 'title',
  blogName: 'blogName',
  createdAt: 'createdAt',
};

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsRepository: Repository<PostOrmEntity>,
    @InjectRepository(PostReactionEntity)
    private readonly postReactionsRepository: Repository<PostReactionEntity>,
  ) {}

  async getPosts(query: GetPostsQueryParamsDto): Promise<Paginator<PostModel[]>> {
    return this.getPaginatedPosts(query);
  }

  async findPostById(id: string): Promise<PostModel | null> {
    const entity = await this.postsRepository.findOne({ where: { id } });
    if (!entity) return null;

    const reactions = await this.postReactionsRepository.find({ where: { postId: id } });
    return toDomain(entity, reactions);
  }

  async getPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParamsDto,
  ): Promise<Paginator<PostModel[]>> {
    return this.getPaginatedPosts(query, blogId);
  }

  private async getPaginatedPosts(
    query: GetPostsQueryParamsDto,
    blogId?: string,
  ): Promise<Paginator<PostModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;
    const qb = this.postsRepository.createQueryBuilder('post');

    if (blogId) {
      qb.andWhere('post.blogId = :blogId', { blogId });
    }

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    applySort(qb, 'post', sortColumn, sortDirection);
    applyPagination(qb, query.calculateSkip(), pageSize);

    const [entities, totalCount] = await qb.getManyAndCount();

    const postIds = entities.map((entity) => entity.id);
    const reactionsByPostId = await this.loadReactionsByPostIds(postIds);

    return PaginatedViewDto.mapToView({
      items: entities.map((entity) => toDomain(entity, reactionsByPostId.get(entity.id) ?? [])),
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  private async loadReactionsByPostIds(
    postIds: string[],
  ): Promise<Map<string, PostReactionEntity[]>> {
    const reactionsByPostId = new Map<string, PostReactionEntity[]>();

    if (postIds.length === 0) {
      return reactionsByPostId;
    }

    const reactions = await this.postReactionsRepository.find({
      where: { postId: In(postIds) },
    });

    for (const reaction of reactions) {
      const existing = reactionsByPostId.get(reaction.postId) ?? [];
      existing.push(reaction);
      reactionsByPostId.set(reaction.postId, existing);
    }

    return reactionsByPostId;
  }
}
