import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';
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
export class UpdatePostUseCase implements IUseCase<UpdatePostInput, Notification<null>> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute({ id, input }: UpdatePostInput): Promise<Notification<null>> {
    await validateOrRejectModel(input, UpdatePostDto, 'UpdatePostUseCase.execute');

    const post = await this.postRepository.findById(id);
    if (!post) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    const blog = await this.blogQueryRepository.findBlogById(input.blogId);
    if (!blog) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    post.update(input, blog.name);
    const saved = await this.postRepository.save(post);
    if (!saved) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    return Notification.ok(null);
  }
}
