import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommonQueryParamsTypes, Paginator, SortDirections } from '@/shared/types/common';
import { calculateAndGetSkipValue } from '@/shared/utils/helpers';

import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';
import { SortPostsBy } from '@/modules/post/models/GetPostsInputModel';
import { PostModel } from '@/modules/post/models/post.model';

import { BlogModel } from '../models/blog.model';
import { SortBlogsBy } from '../models/GetBlogsInputModel';
import { BlogEntity } from './blog.entity';
import { toDomain } from './blog.mapper';

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

const SORT_COLUMN_MAP: Record<SortBlogsBy, keyof BlogEntity> = {
  name: 'name',
  websiteUrl: 'websiteUrl',
  description: 'description',
  isMembership: 'isMembership',
  createdAt: 'createdAt',
};

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async getBlogs({
    searchNameTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetBlogsArgs): Promise<Paginator<BlogModel[]>> {
    const qb = this.blogsRepository.createQueryBuilder('blog');

    if (searchNameTerm) {
      qb.andWhere('blog.name ILIKE :nameTerm', { nameTerm: `%${searchNameTerm}%` });
    }

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    qb.orderBy(`blog.${sortColumn}`, sortDirection === SortDirections.asc ? 'ASC' : 'DESC');

    const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
    const [entities, totalCount] = await qb.skip(skipValue).take(pageSize).getManyAndCount();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      page: pageNumber,
      pageSize,
      totalCount,
      pagesCount,
      items: entities.map(toDomain),
    };
  }

  async getPostsInBlog({
    blogId,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetPostsInBlogArgs): Promise<Paginator<PostModel[]> | null> {
    try {
      const foundBlog = await this.blogsRepository.findOne({ where: { id: blogId } });
      if (!foundBlog) return null;

      return this.postQueryRepository.getPostsByBlogId({
        blogId,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
      });
    } catch (error) {
      console.log(`BlogsQueryRepository.getPostsInBlog error is occurred: ${error}`);
      return null;
    }
  }

  async findBlogById(id: string): Promise<BlogModel | null> {
    const entity = await this.blogsRepository.findOne({ where: { id } });
    return entity ? toDomain(entity) : null;
  }
}
