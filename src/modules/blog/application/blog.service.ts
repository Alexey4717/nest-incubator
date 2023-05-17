import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
// import { randomUUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { TPostDb } from '../../post/models/GetPostOutputModel';
import { LikeStatus } from '../../../types/common';
import { Post, PostDocument } from '../../post/models/Post.schema';
import { GetBlogOutputModelFromMongoDB } from '../models/GetBlogOutputModel';
import { CreatePostInBlogInputAndQueryModel } from '../models/CreatePostInBlogInputModel';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import { BlogQueryRepository } from '../infrastructure/blog-query.repository';
import { BlogRepository } from '../infrastructure/blog.repository';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { validateOrRejectModel } from '../../../helpers';
import { CreatePostInBlogDTO } from '../dto/create-post-in-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogDto;
}

@Injectable()
export class BlogService {
  constructor(
    private blogRepository: BlogRepository,
    private blogQueryRepository: BlogQueryRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  async createBlog(
    input: CreateBlogDTO,
  ): Promise<GetBlogOutputModelFromMongoDB> {
    await validateOrRejectModel(input, CreateBlogDTO, 'BlogService.createBlog');
    const { name, websiteUrl, description } = input || {};

    const newBlog = {
      id: uuidv4(),
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
    await validateOrRejectModel(
      input,
      CreatePostInBlogDTO,
      'BlogService.createPostInBlog',
    );
    const { title, shortDescription, content } = input || {};

    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);

    if (!foundBlog) return null;

    const newPost: TPostDb = {
      id: uuidv4(),
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
    await validateOrRejectModel(input, UpdateBlogDto, 'BlogService.updateBlog');
    return await this.blogRepository.updateBlog({ id, input });
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return await this.blogRepository.deleteBlogById(id);
  }
}
