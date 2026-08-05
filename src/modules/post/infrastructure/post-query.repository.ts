import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { Paginator, SortDirections } from '@/core/types/common';
import { applyPagination, applySort } from '@/core/utils/typeorm-pagination';

import { BlogOrmEntity } from '@/modules/blog/infrastructure/blog.orm-entity';

import { GetPostsQueryParamsDto, SortPostsBy } from '../dto/get-posts-query-params.dto';
import { PostModel } from '../models/post.model';
import { fromRaw, PostRawRow, toDomain } from './post.mapper';
import { PostOrmEntity } from './post.orm-entity';

const SORT_COLUMN_MAP: Record<SortPostsBy, keyof PostOrmEntity> = {
  title: 'title',
  blogName: 'blogName',
  createdAt: 'createdAt',
};

const POST_RAW_SELECT = [
  'post.publicId as "id"',
  'post.title as "title"',
  'post.shortDescription as "shortDescription"',
  'post.content as "content"',
  'blog.publicId as "blogId"',
  'post.blogName as "blogName"',
  'post.createdAt as "createdAt"',
];

const POST_REACTIONS_AGG = `COALESCE(
  jsonb_agg(
    json_build_object(
      'userId', ru.public_id,
      'userLogin', r.user_login,
      'likeStatus', r.like_status,
      'createdAt', r.created_at
    )
  ) FILTER (WHERE r.post_id IS NOT NULL),
  '[]'
)`;

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsRepository: Repository<PostOrmEntity>,
  ) {}

  async getPosts(query: GetPostsQueryParamsDto): Promise<Paginator<PostModel[]>> {
    return this.getPaginatedPosts(query);
  }

  async postExists(id: string): Promise<boolean> {
    return this.postsRepository.exists({ where: { publicId: id } });
  }

  async findPostById(id: string): Promise<PostModel | null> {
    const raw = await this.createPostsQueryBuilder()
      .leftJoin('post.reactions', 'r')
      .leftJoin('users', 'ru', 'r.user_id = ru.id')
      .select(POST_RAW_SELECT)
      .addSelect(POST_REACTIONS_AGG, 'reactions')
      .where('post.publicId = :id', { id })
      .groupBy('post.id')
      .addGroupBy('blog.id')
      .getRawOne<PostRawRow>();

    return raw ? fromRaw(raw) : null;
  }

  async getPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParamsDto,
  ): Promise<Paginator<PostModel[]>> {
    return this.getPaginatedPosts(query, blogId);
  }

  private createPostsQueryBuilder(blogPublicId?: string): SelectQueryBuilder<PostOrmEntity> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .innerJoin(BlogOrmEntity, 'blog', 'post.blogId = blog.id');

    if (blogPublicId) {
      qb.andWhere('blog.publicId = :blogId', { blogId: blogPublicId });
    }

    return qb;
  }

  private async getPaginatedPosts(
    query: GetPostsQueryParamsDto,
    blogId?: string,
  ): Promise<Paginator<PostModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;
    const skip = query.calculateSkip();
    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';

    const totalCount = await this.createPostsQueryBuilder(blogId).getCount();

    const rawRows = await this.createPostsQueryBuilder(blogId)
      .leftJoin('post.reactions', 'r')
      .leftJoin('users', 'ru', 'r.user_id = ru.id')
      .select(POST_RAW_SELECT)
      .addSelect(POST_REACTIONS_AGG, 'reactions')
      .groupBy('post.id')
      .addGroupBy('blog.id')
      .orderBy(`post.${sortColumn}`, sortDirection === SortDirections.asc ? 'ASC' : 'DESC')
      .offset(skip)
      .limit(pageSize)
      .getRawMany<PostRawRow>();

    return PaginatedViewDto.mapToView({
      items: rawRows.map(fromRaw),
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  /**
   * Альтернатива лекции §5.1: leftJoinAndSelect + getManyAndCount.
   * Не используется в production path — основной путь через jsonb_agg + getRawMany.
   */
  private async getPaginatedPostsViaJoin(
    query: GetPostsQueryParamsDto,
    blogId?: string,
  ): Promise<Paginator<PostModel[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;
    const qb = this.createPostsQueryBuilder(blogId).leftJoinAndSelect(
      'post.reactions',
      'reactions',
    );

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    applySort(qb, 'post', sortColumn, sortDirection);
    applyPagination(qb, query.calculateSkip(), pageSize);

    const [entities, totalCount] = await qb.getManyAndCount();

    return PaginatedViewDto.mapToView({
      items: entities.map((entity) => toDomain(entity, entity.reactions ?? [])),
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}
