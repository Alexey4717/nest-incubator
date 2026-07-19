import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { PostQueryRepository } from '../../infrastructure/post-query.repository';
import { PostViewMapper } from '../../post.view-mapper';
import { PostViewModel } from '../../types/view-models';

type GetPostByIdInput = {
  id: string;
  currentUserId?: string | null;
};

@Injectable()
export class GetPostByIdUseCase implements IUseCase<GetPostByIdInput, PostViewModel | null> {
  constructor(
    private readonly postQueryRepository: PostQueryRepository,
    private readonly postViewMapper: PostViewMapper,
  ) {}

  async execute({ id, currentUserId }: GetPostByIdInput): Promise<PostViewModel | null> {
    const post = await this.postQueryRepository.findPostById(id);
    if (!post) return null;
    return this.postViewMapper.toPostViewModel(post, currentUserId);
  }
}
