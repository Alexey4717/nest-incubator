import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { BlogEntity } from '../../domain/entities/blog.entity';
import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { fromEntity } from '../../infrastructure/blog.mapper';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { BlogModel } from '../../models/blog.model';

@Injectable()
export class CreateBlogUseCase implements IUseCase<CreateBlogDTO, BlogModel> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(input: CreateBlogDTO): Promise<BlogModel> {
    await validateOrRejectModel(input, CreateBlogDTO, 'CreateBlogUseCase.execute');
    const { name, websiteUrl, description } = input || {};

    const newBlog = BlogEntity.create({ name, websiteUrl, description });
    const saved = await this.blogRepository.createBlog(newBlog);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return fromEntity(saved);
  }
}
