import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { LikeStatus } from '@/modules/like/types/like-status';
import { FindUserByIdUseCase } from '@/modules/user/application/use-cases/find-user-by-id.use-case';

import { PostRepository } from '../../infrastructure/post.repository.mongodb';

type UpdatePostLikeStatusInput = {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
};

@Injectable()
export class UpdatePostLikeStatusUseCase implements IUseCase<UpdatePostLikeStatusInput, boolean> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute({ postId, userId, likeStatus }: UpdatePostLikeStatusInput): Promise<boolean> {
    const user = await this.findUserByIdUseCase.execute(userId);
    if (!user) return false;

    return this.postRepository.updatePostLikeStatus({
      postId,
      userId,
      userLogin: user.accountData.login,
      likeStatus,
    });
  }
}
