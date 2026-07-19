import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { BlogRepository } from '../../infrastructure/blog.repository';

type UpdateBlogInput = {
  id: string;
  input: UpdateBlogDto;
};

@Injectable()
export class UpdateBlogUseCase implements IUseCase<UpdateBlogInput, ResultType<null>> {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute({ id, input }: UpdateBlogInput): Promise<ResultType<null>> {
    await validateOrRejectModel(input, UpdateBlogDto, 'UpdateBlogUseCase.execute');

    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    const blogWithSameName = await this.blogQueryRepository.findBlogByName(input.name);

    try {
      blog.ensureNameIsUnique(blogWithSameName?.id);
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    blog.update(input);
    const updateResult = await this.blogRepository.save(blog);
    if (!updateResult) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(null);
  }
}
