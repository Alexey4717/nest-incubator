import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { LikeStatus } from '@/modules/like/types/like-status';

import { PostRepository } from '../../infrastructure/post.repository';

type UpdatePostLikeStatusInput = {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
};

@Injectable()
export class UpdatePostLikeStatusUseCase implements IUseCase<
  UpdatePostLikeStatusInput,
  ResultType<null>
> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({
    postId,
    userId,
    likeStatus,
  }: UpdatePostLikeStatusInput): Promise<ResultType<null>> {
    const updated = await this.postRepository.updatePostLikeStatus({
      postId,
      userId,
      likeStatus,
    });
    if (!updated) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
