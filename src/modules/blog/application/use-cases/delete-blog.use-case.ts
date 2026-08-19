import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { BlogRepository } from '../../infrastructure/blog.repository';

@Injectable()
export class DeleteBlogUseCase implements IUseCase<string, Notification<null>> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(id: string): Promise<Notification<null>> {
    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    const deleteResult = await this.blogRepository.deleteBlogById(id);
    if (!deleteResult) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(null);
  }
}
