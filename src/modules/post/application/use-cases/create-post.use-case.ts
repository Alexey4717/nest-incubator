import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { Result } from '@/core/result/result.factory';
import { ResultStatus, Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

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
export class CreatePostUseCase implements IUseCase<CreatePostInput, ResultType<PostModel>> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postViewMapper: PostViewMapper,
    @Inject(forwardRef(() => BlogQueryRepository))
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<ResultType<PostModel>> {
    const { blogId, title, shortDescription, content } = input;

    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);
    if (!foundBlog) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    const newPost = PostEntity.create({ title, shortDescription, content, blogId }, foundBlog.name);

    const saved = await this.postRepository.createPost(newPost);
    if (!saved) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }

    return Result.ok(fromEntity(saved));
  }

  async executeFromDto(input: CreatePostDto): Promise<ResultType<PostViewModel>> {
    await validateOrRejectModel(input, CreatePostDto, 'CreatePostUseCase.executeFromDto');

    const result = await this.execute(input);
    if (result.status === ResultStatus.Failure) {
      return Result.fail(result.code, result.extensions);
    }

    return Result.ok(this.postViewMapper.toPostViewModel(result.data));
  }
}
