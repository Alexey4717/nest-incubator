import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { getMappedPostViewModel } from '../../helpers';
import { PostQueryRepository } from '../../infrastructure/post-query.repository.mongodb';
import { PostViewModel } from '../../types/view-models';

type GetPostByIdInput = {
  id: string;
  currentUserId?: string | null;
};

@Injectable()
export class GetPostByIdUseCase implements IUseCase<GetPostByIdInput, PostViewModel | null> {
  constructor(private readonly postQueryRepository: PostQueryRepository) {}

  async execute({ id, currentUserId }: GetPostByIdInput): Promise<PostViewModel | null> {
    const post = await this.postQueryRepository.findPostById(id);
    if (!post) return null;
    return getMappedPostViewModel({ ...post, currentUserId });
  }
}
