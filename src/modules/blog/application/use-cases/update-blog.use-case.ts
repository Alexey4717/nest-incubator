import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { BlogEntity } from '../../domain/entities/blog.entity';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { modelToDb } from '../../infrastructure/blog.mapper';
import { BlogRepository } from '../../infrastructure/blog.repository';

type UpdateBlogInput = {
  id: string;
  input: UpdateBlogDto;
};

@Injectable()
export class UpdateBlogUseCase implements IUseCase<UpdateBlogInput, boolean> {
  constructor(
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly blogRepository: BlogRepository,
  ) {}

  async execute({ id, input }: UpdateBlogInput): Promise<boolean> {
    await validateOrRejectModel(input, UpdateBlogDto, 'UpdateBlogUseCase.execute');

    const found = await this.blogQueryRepository.findBlogById(id);
    if (!found) return false;

    const blogWithSameName = await this.blogQueryRepository.findBlogByName(input.name);
    if (blogWithSameName && blogWithSameName.id !== id) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'This name already exists', field: 'name' },
      ]);
    }

    const blog = BlogEntity.reconstitute(modelToDb(found));
    blog.update(input);
    return this.blogRepository.save(blog);
  }
}
