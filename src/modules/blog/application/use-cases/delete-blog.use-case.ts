import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { BlogRepository } from '../../infrastructure/blog.repository';

@Injectable()
export class DeleteBlogUseCase implements IUseCase<string, ResultType<null>> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(id: string): Promise<ResultType<null>> {
    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    const deleteResult = await this.blogRepository.deleteBlogById(id);
    if (!deleteResult) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(null);
  }
}
