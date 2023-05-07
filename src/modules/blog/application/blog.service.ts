import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { TPostDb } from '../../post/models/GetPostOutputModel';
import { LikeStatus } from '../../../types/common';
import { Post, PostDocument } from '../../post/models/Post.schema';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { GetBlogOutputModelFromMongoDB } from '../models/GetBlogOutputModel';
import { CreatePostInBlogInputAndQueryModel } from '../models/CreatePostInBlogInputModel';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import { BlogQueryRepository } from '../infrastructure/blog-query.repository';
import { BlogRepository } from '../infrastructure/blog.repository';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

@Injectable()
export class BlogService {
  constructor(
    private blogRepository: BlogRepository,
    private blogQueryRepository: BlogQueryRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  async createBlog(
    input: CreateBlogInputModel,
  ): Promise<GetBlogOutputModelFromMongoDB> {
    const { name, websiteUrl, description } = input || {};

    const newBlog = {
      id: randomUUID(),
      name,
      websiteUrl,
      description,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    return (await this.blogRepository.createBlog(
      newBlog,
    )) as GetBlogOutputModelFromMongoDB;
  }

  async createPostInBlog({
    blogId,
    input,
  }: CreatePostInBlogInputAndQueryModel): Promise<TPostDb | null> {
    const { title, shortDescription, content } = input || {};

    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);

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

    await this.blogRepository.createPostInBlog(newPost);
    return newPost as TPostDb;
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<boolean> {
    return await this.blogRepository.updateBlog({ id, input });
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return await this.blogRepository.deleteBlogById(id);
  }
}
