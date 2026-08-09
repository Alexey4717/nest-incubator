import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { BlogQueryRepository } from '@/modules/blog/infrastructure/blog-query.repository';

import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostRepository } from '../../infrastructure/post.repository';

type UpdatePostInput = {
  id: string;
  input: UpdatePostDto;
};

@Injectable()
export class UpdatePostUseCase implements IUseCase<UpdatePostInput, ResultType<null>> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute({ id, input }: UpdatePostInput): Promise<ResultType<null>> {
    await validateOrRejectModel(input, UpdatePostDto, 'UpdatePostUseCase.execute');

    const post = await this.postRepository.findById(id);
    if (!post) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    const blog = await this.blogQueryRepository.findBlogById(input.blogId);
    if (!blog) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    post.update(input, blog.name);
    const saved = await this.postRepository.save(post);
    if (!saved) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
