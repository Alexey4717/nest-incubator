import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { BlogModel } from '../../models/blog.model';

@Injectable()
export class GetBlogByIdUseCase implements IUseCase<string, BlogModel | null> {
  constructor(private readonly blogQueryRepository: BlogQueryRepository) {}

  async execute(id: string): Promise<BlogModel | null> {
    return this.blogQueryRepository.findBlogById(id);
  }
}
