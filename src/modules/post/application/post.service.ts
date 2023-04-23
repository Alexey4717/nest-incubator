import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  GetMappedPostOutputModel,
  TPostDb,
} from '../models/GetPostOutputModel';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { LikeStatus } from '../../../types/common';
import { Post } from '../models/Post.schema';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { PostRepository } from '../infrastructure/post.repository';

interface UpdatePostArgs {
  id: string;
  input: UpdatePostInputModel;
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
    private readonly postRepository: PostRepository,
    @InjectModel(Post.name) private PostModel: Model<Post>,
  ) {}

  _mapPostToViewType(post: TPostDb): GetMappedPostOutputModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }

  async createPost(
    input: CreatePostInputModel,
  ): Promise<GetMappedPostOutputModel | null> {
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await blogsQueryRepository.findBlogById(blogId);

    if (!foundBlog) return null;

    // TODO add DTO
    const newPost: TPostDb = await this.PostModel.create({
      _id: new Types.ObjectId(),
      title,
      shortDescription,
      blogId,
      blogName: foundBlog.name,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
    });

    const postFromDB = await this.postRepository.createPost(newPost);
    return this._mapPostToViewType(postFromDB);
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
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
