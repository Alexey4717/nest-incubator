import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { BlogRepository } from '../../infrastructure/blog.repository';

type UpdateBlogInput = {
  id: string;
  input: UpdateBlogDto;
};

@Injectable()
export class UpdateBlogUseCase implements IUseCase<UpdateBlogInput, Notification<null>> {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute({ id, input }: UpdateBlogInput): Promise<Notification<null>> {
    await validateOrRejectModel(input, UpdateBlogDto, 'UpdateBlogUseCase.execute');

    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    const blogWithSameName = await this.blogQueryRepository.findBlogByName(input.name);

    try {
      blog.ensureNameIsUnique(blogWithSameName?.id);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }

    blog.update(input);
    const updateResult = await this.blogRepository.save(blog);
    if (!updateResult) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
