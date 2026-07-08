import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReactionUpdateService } from '@/modules/like/application/services/reaction-update.service';
import { LikeStatus } from '@/modules/like/types/like-status';

import { PostModel } from '../models/post.model';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { PostQueryRepository } from './post-query.repository';
import { PostReactionEntity } from './post-reaction.entity';
import { PostEntity } from './post.entity';
import { toDomain, toOrm } from './post.mapper';

export interface UpdatePostArgs {
  id: string;
  input: UpdatePostInputModel;
}

export interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(PostReactionEntity)
    private readonly postReactionsRepository: Repository<PostReactionEntity>,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly reactionUpdateService: ReactionUpdateService,
  ) {}

  async createPost(newPost: PostModel): Promise<PostModel | null> {
    try {
      const entity = toOrm(newPost);
      const saved = await this.postsRepository.save(entity);
      return toDomain(saved, []);
    } catch (error) {
      console.log(`postsRepository.createPost error is occurred: ${error}`);
      return null;
    }
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    try {
      const result = await this.postsRepository.update({ id }, input);
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`postsRepository.updatePost error is occurred: ${error}`);
      return false;
    }
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    try {
      const foundPost = await this.postQueryRepository.findPostById(postId);
      if (!foundPost) return false;

      const plan = this.reactionUpdateService.planReactionUpdate({
        reactions: foundPost.reactions ?? [],
        userId,
        likeStatus,
        userLogin,
      });

      if (plan.action === 'noop') return true;

      if (plan.action === 'push') {
        const reaction = new PostReactionEntity();
        reaction.postId = postId;
        reaction.userId = plan.reaction.userId;
        reaction.userLogin = plan.reaction.userLogin ?? userLogin;
        reaction.likeStatus = plan.reaction.likeStatus;
        reaction.createdAt = new Date(plan.reaction.createdAt);
        await this.postReactionsRepository.save(reaction);
        return true;
      }

      if (plan.action === 'pull') {
        const result = await this.postReactionsRepository.delete({
          postId,
          userId: plan.userId,
        });
        return (result.affected ?? 0) === 1;
      }

      const result = await this.postReactionsRepository.update(
        { postId, userId: plan.userId },
        {
          likeStatus: plan.likeStatus,
          createdAt: new Date(plan.createdAt),
          userLogin,
        },
      );
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log('postsRepository.updatePostLikeStatus error is occurred: ', error);
      return false;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.postsRepository.delete({ id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`postsRepository.deletePostById error is occurred: ${error}`);
      return false;
    }
  }
}
