import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/validate-or-reject-model';

import { BlogQueryRepository } from '@/modules/blog/infrastructure/blog-query.repository';

import { PostEntity } from '../../domain/entities/post.entity';
import { CreatePostDto } from '../../dto/create-post.dto';
import { fromEntity } from '../../infrastructure/post.mapper';
import { PostRepository } from '../../infrastructure/post.repository';
import { PostModel } from '../../models/post.model';
import { PostViewMapper } from '../../post.view-mapper';
import { PostViewModel } from '../../types/view-models';

export type CreatePostInput = {
  blogId: string;
  title: string;
  shortDescription: string;
  content: string;
};

@Injectable()
export class CreatePostUseCase implements IUseCase<CreatePostInput, Notification<PostModel>> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postViewMapper: PostViewMapper,
    @Inject(forwardRef(() => BlogQueryRepository))
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<Notification<PostModel>> {
    const { blogId, title, shortDescription, content } = input;

    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);
    if (!foundBlog) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    const newPost = PostEntity.create({ title, shortDescription, content, blogId }, foundBlog.name);

    const saved = await this.postRepository.createPost(newPost);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Notification.ok(fromEntity(saved));
  }

  async executeFromDto(input: CreatePostDto): Promise<Notification<PostViewModel>> {
    await validateOrRejectModel(input, CreatePostDto, 'CreatePostUseCase.executeFromDto');

    const result = await this.execute(input);
    if (result.hasError()) {
      return Notification.fail(result.code, result.messages);
    }

    return Notification.ok(this.postViewMapper.toPostViewModel(result.data as PostModel));
  }
}
