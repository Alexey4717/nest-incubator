import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { LikeStatus } from '@/modules/like/types/like-status';

import { PostRepository } from '../../infrastructure/post.repository';

type UpdatePostLikeStatusInput = {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
  userLogin: string;
};

@Injectable()
export class UpdatePostLikeStatusUseCase implements IUseCase<UpdatePostLikeStatusInput, boolean> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({
    postId,
    userId,
    likeStatus,
    userLogin,
  }: UpdatePostLikeStatusInput): Promise<boolean> {
    return this.postRepository.updatePostLikeStatus({
      postId,
      userId,
      userLogin,
      likeStatus,
    });
  }
}
