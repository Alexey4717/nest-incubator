import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
  GetMappedPostOutputModel,
  TPostDb,
} from '../../post/models/GetPostOutputModel';
import { CreatePostInputModel } from '../../post/models/CreatePostInputModel';
import { LikeStatus } from '../../../types/common';
import { Post } from '../../post/models/Post.schema';
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

interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly blogQueryRepository: BlogQueryRepository,
    @InjectModel(Post.name) private PostModel: Model<Post>,
  ) {}

  async createBlog(
    input: CreateBlogInputModel,
  ): Promise<GetBlogOutputModelFromMongoDB> {
    const { name, websiteUrl, description } = input || {};

    const newBlog = {
      name,
      websiteUrl,
      description,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    await this.blogRepository.createBlog(newBlog);
    return newBlog as GetBlogOutputModelFromMongoDB;
  }

  async createPostInBlog({
    blogId,
    input,
  }: CreatePostInBlogInputAndQueryModel): Promise<TPostDb | null> {
    const { title, shortDescription, content } = input || {};

    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);

    if (!foundBlog) return null;

    const newPost: TPostDb = {
      _id: new ObjectId(),
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
