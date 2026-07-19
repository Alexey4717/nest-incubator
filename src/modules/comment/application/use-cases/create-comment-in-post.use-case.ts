import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { PostQueryRepository } from '@/modules/post/infrastructure/post-query.repository';

import { CommentEntity } from '../../domain/entities/comment.entity';
import { fromEntity } from '../../infrastructure/comment.mapper';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentModel } from '../../models/comment.model';

export type CreateCommentInPostInput = {
  postId: string;
  userId: string;
  userLogin: string;
  content: string;
};

@Injectable()
export class CreateCommentInPostUseCase implements IUseCase<
  CreateCommentInPostInput,
  ResultType<CommentModel>
> {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => PostQueryRepository))
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  async execute(input: CreateCommentInPostInput): Promise<ResultType<CommentModel>> {
    const { postId, content, userId, userLogin } = input;

    const foundPost = await this.postQueryRepository.findPostById(postId);
    if (!foundPost) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    const newComment = CommentEntity.create({ postId, content, userId, userLogin });

    const result = await this.commentRepository.createCommentInPost(newComment);
    if (!result) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(fromEntity(newComment));
  }
}
