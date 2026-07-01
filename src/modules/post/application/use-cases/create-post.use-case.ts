import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { Blog, BlogDocument } from '@/modules/blog/models/blog.schema';

import { CreatePostDto } from '../../dto/create-post.dto';
import { getMappedPostViewModel } from '../../helpers';
import { PostRepository } from '../../infrastructure/post.repository.mongodb';
import { TPostDb } from '../../models/GetPostOutputModel';
import { PostViewModel } from '../../types/view-models';

export type CreatePostInput = {
  blogId: string;
  title: string;
  shortDescription: string;
  content: string;
};

@Injectable()
export class CreatePostUseCase implements IUseCase<CreatePostInput, TPostDb | null> {
  constructor(
    private readonly postRepository: PostRepository,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async execute(input: CreatePostInput): Promise<TPostDb | null> {
    const { blogId, title, shortDescription, content } = input;

    const foundBlog = await this.blogModel.findOne({ id: blogId }).lean();
    if (!foundBlog) return null;

    const newPost: TPostDb = {
      id: randomUUID(),
      title,
      shortDescription,
      blogId,
      blogName: foundBlog.name,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    const postFromDb = await this.postRepository.createPost(newPost);
    if (!postFromDb) return null;

    return postFromDb;
  }

  async executeFromDto(input: CreatePostDto): Promise<PostViewModel | null> {
    await validateOrRejectModel(input, CreatePostDto, 'CreatePostUseCase.executeFromDto');
    const post = await this.execute(input);
    if (!post) return null;
    return getMappedPostViewModel(post);
  }
}
