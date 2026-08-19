import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { CreatePostUseCase } from '@/modules/post/application/use-cases/create-post.use-case';
import { PostModel } from '@/modules/post/models/post.model';

import { CreatePostInBlogDTO } from '../../dto/create-post-in-blog.dto';

type CreatePostInBlogInput = {
  blogId: string;
  input: CreatePostInBlogDTO;
};

@Injectable()
export class CreatePostInBlogUseCase implements IUseCase<
  CreatePostInBlogInput,
  Notification<PostModel>
> {
  constructor(
    @Inject(forwardRef(() => CreatePostUseCase))
    private readonly createPostUseCase: CreatePostUseCase,
  ) {}

  async execute({ blogId, input }: CreatePostInBlogInput): Promise<Notification<PostModel>> {
    await validateOrRejectModel(input, CreatePostInBlogDTO, 'CreatePostInBlogUseCase.execute');
    const { title, shortDescription, content } = input;

    return this.createPostUseCase.execute({ blogId, title, shortDescription, content });
  }
}
