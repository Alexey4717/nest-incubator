import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CommonQueryParamsTypes, Paginator, SortDirections } from '@/shared/types/common';
import { calculateAndGetSkipValue } from '@/shared/utils/helpers';

import { SortPostsBy } from '../models/GetPostsInputModel';
import { PostModel } from '../models/post.model';
import { PostReactionEntity } from './post-reaction.entity';
import { PostEntity } from './post.entity';
import { toDomain } from './post.mapper';

export type GetPostsArgs = CommonQueryParamsTypes & {
  sortBy: SortPostsBy;
};

export type GetPostsByBlogIdArgs = GetPostsArgs & {
  blogId: string;
};

const SORT_COLUMN_MAP: Record<SortPostsBy, keyof PostEntity> = {
  title: 'title',
  blogName: 'blogName',
  createdAt: 'createdAt',
};

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(PostReactionEntity)
    private readonly postReactionsRepository: Repository<PostReactionEntity>,
  ) {}

  async getPosts({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetPostsArgs): Promise<Paginator<PostModel[]>> {
    return this.getPaginatedPosts({ sortBy, sortDirection, pageNumber, pageSize });
  }

  async findPostById(id: string): Promise<PostModel | null> {
    const entity = await this.postsRepository.findOne({ where: { id } });
    if (!entity) return null;

    const reactions = await this.postReactionsRepository.find({ where: { postId: id } });
    return toDomain(entity, reactions);
  }

  async getPostsByBlogId(args: GetPostsByBlogIdArgs): Promise<Paginator<PostModel[]>> {
    return this.getPaginatedPosts(args, args.blogId);
  }

  private async getPaginatedPosts(
    { sortBy, sortDirection, pageNumber, pageSize }: GetPostsArgs,
    blogId?: string,
  ): Promise<Paginator<PostModel[]>> {
    const qb = this.postsRepository.createQueryBuilder('post');

    if (blogId) {
      qb.andWhere('post.blogId = :blogId', { blogId });
    }

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    qb.orderBy(`post.${sortColumn}`, sortDirection === SortDirections.asc ? 'ASC' : 'DESC');

    const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
    const [entities, totalCount] = await qb.skip(skipValue).take(pageSize).getManyAndCount();
    const pagesCount = Math.ceil(totalCount / pageSize);

    const postIds = entities.map((entity) => entity.id);
    const reactionsByPostId = await this.loadReactionsByPostIds(postIds);

    return {
      page: pageNumber,
      pageSize,
      totalCount,
      pagesCount,
      items: entities.map((entity) => toDomain(entity, reactionsByPostId.get(entity.id) ?? [])),
    };
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
