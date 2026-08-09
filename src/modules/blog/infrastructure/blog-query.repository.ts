import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { applyPagination, applySort } from '@/core/typeorm/typeorm-pagination';
import { Paginator } from '@/core/types/common';

import { GetPostsQueryParamsDto } from '@/modules/post/dto/get-posts-query-params.dto';
import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';
import { PostModel } from '@/modules/post/models/post.model';

import { GetBlogsQueryParamsDto, SortBlogsBy } from '../dto/get-blogs-query-params.dto';
import { BlogModel } from '../models/blog.model';
import { toDomain } from './blog.mapper';
import { BlogOrmEntity } from './blog.orm-entity';

const SORT_COLUMN_MAP: Record<SortBlogsBy, keyof BlogOrmEntity> = {
  name: 'name',
  websiteUrl: 'websiteUrl',
  description: 'description',
  isMembership: 'isMembership',
  createdAt: 'createdAt',
};

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectRepository(BlogOrmEntity)
    private readonly blogsRepository: Repository<BlogOrmEntity>,
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
      const foundBlog = await this.blogsRepository.findOne({ where: { publicId: blogId } });
      if (!foundBlog) return null;

      return this.postQueryRepository.getPostsByBlogId(blogId, query);
    } catch (error) {
      console.log(`BlogsQueryRepository.getPostsInBlog error is occurred: ${error}`);
      return null;
    }
  }

  async findBlogById(id: string): Promise<BlogModel | null> {
    const entity = await this.blogsRepository.findOne({ where: { publicId: id } });
    return entity ? toDomain(entity) : null;
  }

  async findBlogByName(name: string): Promise<BlogModel | null> {
    const entity = await this.blogsRepository.findOne({ where: { name } });
    return entity ? toDomain(entity) : null;
  }
}
