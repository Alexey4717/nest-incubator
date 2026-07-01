import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { CreatePostUseCase } from '@/modules/post/application/use-cases/create-post.use-case';
import { TPostDb } from '@/modules/post/models/GetPostOutputModel';

import { CreatePostInBlogDTO } from '../../dto/create-post-in-blog.dto';

type CreatePostInBlogInput = {
  blogId: string;
  input: CreatePostInBlogDTO;
};

@Injectable()
export class CreatePostInBlogUseCase implements IUseCase<CreatePostInBlogInput, TPostDb | null> {
  constructor(private readonly createPostUseCase: CreatePostUseCase) {}

  async execute({ blogId, input }: CreatePostInBlogInput): Promise<TPostDb | null> {
    await validateOrRejectModel(input, CreatePostInBlogDTO, 'CreatePostInBlogUseCase.execute');
    const { title, shortDescription, content } = input;

    return this.createPostUseCase.execute({ blogId, title, shortDescription, content });
  }
}
