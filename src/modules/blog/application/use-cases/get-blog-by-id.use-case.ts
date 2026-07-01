import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { getMappedBlogViewModel } from '../../helpers';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository.mongodb';
import { BlogViewModel } from '../../types/view-models';

@Injectable()
export class GetBlogByIdUseCase implements IUseCase<string, BlogViewModel | null> {
  constructor(private readonly blogQueryRepository: BlogQueryRepository) {}

  async execute(id: string): Promise<BlogViewModel | null> {
    const blog = await this.blogQueryRepository.findBlogById(id);
    if (!blog) return null;
    return getMappedBlogViewModel(blog);
  }
}
