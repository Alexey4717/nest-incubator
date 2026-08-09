import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { PostRepository } from '../../infrastructure/post.repository';

@Injectable()
export class DeletePostUseCase implements IUseCase<string, ResultType<null>> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(id: string): Promise<ResultType<null>> {
    const deleted = await this.postRepository.deletePostById(id);
    if (!deleted) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
