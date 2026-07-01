import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { BlogRepository } from '../../infrastructure/blog.repository.mongodb';

@Injectable()
export class DeleteBlogUseCase implements IUseCase<string, boolean> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.blogRepository.deleteBlogById(id);
  }
}
