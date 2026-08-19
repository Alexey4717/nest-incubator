import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { BlogEntity } from '../../domain/entities/blog.entity';
import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { fromEntity } from '../../infrastructure/blog.mapper';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { BlogModel } from '../../models/blog.model';

@Injectable()
export class CreateBlogUseCase implements IUseCase<CreateBlogDTO, Notification<BlogModel>> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(input: CreateBlogDTO): Promise<Notification<BlogModel>> {
    await validateOrRejectModel(input, CreateBlogDTO, 'CreateBlogUseCase.execute');
    const { name, websiteUrl, description } = input || {};

    const newBlog = BlogEntity.create({ name, websiteUrl, description });
    const saved = await this.blogRepository.createBlog(newBlog);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(fromEntity(saved));
  }
}
