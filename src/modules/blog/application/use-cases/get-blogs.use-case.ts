import { Injectable } from '@nestjs/common';

import { Paginator } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';

import { GetBlogsQueryParamsDto } from '../../dto/get-blogs-query-params.dto';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { BlogModel } from '../../models/blog.model';

@Injectable()
export class GetBlogsUseCase implements IUseCase<GetBlogsQueryParamsDto, Paginator<BlogModel[]>> {
  constructor(private readonly blogQueryRepository: BlogQueryRepository) {}

  async execute(input: GetBlogsQueryParamsDto): Promise<Paginator<BlogModel[]>> {
    return this.blogQueryRepository.getBlogs(input);
  }
}
