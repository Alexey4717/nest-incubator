import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginatedViewDto } from '@/shared/dto/paginated-view.dto';
import { Paginator } from '@/shared/types/common';
import { applyPagination, applySort } from '@/shared/utils/typeorm-pagination';

import { GetPostsQueryParamsDto } from '@/modules/post/dto/get-posts-query-params.dto';
import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';
import { PostModel } from '@/modules/post/models/post.model';

import { GetBlogsQueryParamsDto, SortBlogsBy } from '../dto/get-blogs-query-params.dto';
import { BlogModel } from '../models/blog.model';
import { BlogEntity } from './blog.entity';
import { toDomain } from './blog.mapper';

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

  async getBlogs(query: GetBlogsQueryParamsDto): Promise<Paginator<BlogModel[]>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = query;
    const qb = this.blogsRepository.createQueryBuilder('blog');

    if (searchNameTerm) {
      qb.andWhere('blog.name ILIKE :nameTerm', { nameTerm: `%${searchNameTerm}%` });
    }

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    applySort(qb, 'blog', sortColumn, sortDirection);
    applyPagination(qb, query.calculateSkip(), pageSize);

    const [entities, totalCount] = await qb.getManyAndCount();

    return PaginatedViewDto.mapToView({
      items: entities.map(toDomain),
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  async getPostsInBlog(
    blogId: string,
    query: GetPostsQueryParamsDto,
  ): Promise<Paginator<PostModel[]> | null> {
    try {
      const foundBlog = await this.blogsRepository.findOne({ where: { id: blogId } });
      if (!foundBlog) return null;

      return this.postQueryRepository.getPostsByBlogId(blogId, query);
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
