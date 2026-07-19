import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

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
export class CreatePostUseCase implements IUseCase<CreatePostInput, PostModel | null> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postViewMapper: PostViewMapper,
    @Inject(forwardRef(() => BlogQueryRepository))
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<PostModel | null> {
    const { blogId, title, shortDescription, content } = input;

    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);
    if (!foundBlog) return null;

    const newPost = PostEntity.create({ title, shortDescription, content, blogId }, foundBlog.name);

    const saved = await this.postRepository.createPost(newPost);
    return saved ? fromEntity(saved) : null;
  }

  async executeFromDto(input: CreatePostDto): Promise<PostViewModel | null> {
    await validateOrRejectModel(input, CreatePostDto, 'CreatePostUseCase.executeFromDto');
    const post = await this.execute(input);
    if (!post) return null;
    return this.postViewMapper.toPostViewModel(post);
  }
}
