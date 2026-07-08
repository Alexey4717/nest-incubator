import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';

type UpdateBlogInput = {
  id: string;
  input: UpdateBlogDto;
};

@Injectable()
export class UpdateBlogUseCase implements IUseCase<UpdateBlogInput, boolean> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute({ id, input }: UpdateBlogInput): Promise<boolean> {
    await validateOrRejectModel(input, UpdateBlogDto, 'UpdateBlogUseCase.execute');
    return this.blogRepository.updateBlog({ id, input });
  }
}
