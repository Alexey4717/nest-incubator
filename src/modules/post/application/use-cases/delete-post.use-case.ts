import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { PostRepository } from '../../infrastructure/post.repository';

@Injectable()
export class DeletePostUseCase implements IUseCase<string, boolean> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.postRepository.deletePostById(id);
  }
}
