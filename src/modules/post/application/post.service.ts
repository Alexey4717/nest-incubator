import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { randomUUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { LikeStatus } from '@/shared/types/common';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { Blog, BlogDocument } from '@/modules/blog/models/blog.schema';
import { CreateUserDTO } from '@/modules/user/dto/create-user.dto';

import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostRepository } from '../infrastructure/post.repository.mongodb';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { GetMappedPostOutputModel, TPostDb } from '../models/GetPostOutputModel';
import { Post, PostDocument } from '../models/post.schema';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';

interface UpdatePostArgs {
  id: string;
  input: UpdatePostDto;
}

interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  _mapPostToViewType(post: TPostDb): GetMappedPostOutputModel {
    if (!post?.id) {
      throw new Error('PostService._mapPostToViewType have no id created post');
    }

    return {
      id: post?.id,
      title: post?.title,
      shortDescription: post?.shortDescription,
      content: post?.content,
      blogId: post?.blogId,
      blogName: post?.blogName,
      createdAt: post?.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }

  async createPost(input: CreatePostDto): Promise<GetMappedPostOutputModel | null> {
    await validateOrRejectModel(input, CreatePostDto, 'PostService.createPost');
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await this.BlogModel.findOne({ id: blogId });

    if (!foundBlog) return null;

    // TODO add DTO
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

    const postFromDB = await this.postRepository.createPost(newPost);
    console.log({ postFromDB });
    return this._mapPostToViewType(postFromDB);
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    await validateOrRejectModel(input, UpdatePostDto, 'PostService.updatePost');
    return await this.postRepository.updatePost({ id, input });
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    return await this.postRepository.updatePostLikeStatus({
      postId,
      userId,
      userLogin,
      likeStatus,
    });
  }

  async deletePostById(id: string): Promise<boolean> {
    return await this.postRepository.deletePostById(id);
  }
}
