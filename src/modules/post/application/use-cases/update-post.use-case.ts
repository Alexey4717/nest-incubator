import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

import { BlogQueryRepository } from '@/modules/blog/infrastructure/blog-query.repository';

import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostRepository } from '../../infrastructure/post.repository';

type UpdatePostInput = {
  id: string;
  input: UpdatePostDto;
};

@Injectable()
export class UpdatePostUseCase implements IUseCase<UpdatePostInput, boolean> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute({ id, input }: UpdatePostInput): Promise<boolean> {
    await validateOrRejectModel(input, UpdatePostDto, 'UpdatePostUseCase.execute');

    const post = await this.postRepository.findById(id);
    if (!post) return false;

    const blog = await this.blogQueryRepository.findBlogById(input.blogId);
    if (!blog) return false;

    post.update(input, blog.name);
    return this.postRepository.save(post);
  }
}
