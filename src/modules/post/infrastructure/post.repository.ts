import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ReactionUpdateService } from '@/modules/like/application/services/reaction-update.service';
import { LikeStatus } from '@/modules/like/types/like-status';
import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

import { PostEntity } from '../domain/entities/post.entity';
import { PostPersistenceMapper } from '../domain/mappers/post.persistence-mapper';
import { PostReactionEntity } from './post-reaction.entity';
import { reactionToDomain } from './post.mapper';
import { PostOrmEntity } from './post.orm-entity';

export interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsRepository: Repository<PostOrmEntity>,
    @InjectRepository(PostReactionEntity)
    private readonly postReactionsRepository: Repository<PostReactionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly reactionUpdateService: ReactionUpdateService,
  ) {}

  async createPost(newPost: PostEntity): Promise<PostEntity | null> {
    try {
      const entity = PostPersistenceMapper.toPersistence(newPost);
      const saved = await this.postsRepository.save(entity);
      return PostPersistenceMapper.toDomain(saved);
    } catch (error) {
      console.log(`postsRepository.createPost error is occurred: ${error}`);
      return null;
    }
  }

  async findById(id: string): Promise<PostEntity | null> {
    const entity = await this.postsRepository.findOne({ where: { id } });
    return entity ? PostPersistenceMapper.toDomain(entity) : null;
  }

  async save(post: PostEntity): Promise<boolean> {
    const data = post.toDb();
    const result = await this.postsRepository.update(
      { id: data.id },
      {
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
        blogId: data.blogId,
        blogName: data.blogName,
      },
    );
    return (result.affected ?? 0) === 1;
  }

  async updatePostLikeStatus({
    postId,
    userId,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const postsRepository = manager.getRepository(PostOrmEntity);
        const postReactionsRepository = manager.getRepository(PostReactionEntity);

        const postExists = await postsRepository.exists({ where: { id: postId } });
        if (!postExists) return false;

        const existingReactionEntity = await postReactionsRepository.findOne({
          where: { postId, userId },
        });
        const reactions = existingReactionEntity ? [reactionToDomain(existingReactionEntity)] : [];

        let plan = this.reactionUpdateService.planReactionUpdate({
          reactions,
          userId,
          likeStatus,
        });

        let userLogin: string | null = null;
        if (plan.action === 'push' || plan.action === 'update') {
          const usersRepository = manager.getRepository(UserOrmEntity);
          const userEntity = await usersRepository.findOne({
            where: { id: userId },
            select: { login: true },
          });
          userLogin = userEntity?.login ?? null;
          if (!userLogin) return false;

          plan = this.reactionUpdateService.planReactionUpdate({
            reactions,
            userId,
            likeStatus,
            userLogin,
          });
        }

        if (plan.action === 'noop') return true;

        if (plan.action === 'push') {
          const reaction = new PostReactionEntity();
          reaction.postId = postId;
          reaction.userId = plan.reaction.userId;
          reaction.userLogin = plan.reaction.userLogin ?? userLogin ?? '';
          reaction.likeStatus = plan.reaction.likeStatus;
          reaction.createdAt = new Date(plan.reaction.createdAt);
          await postReactionsRepository.save(reaction);
          return true;
        }

        if (plan.action === 'pull') {
          const result = await postReactionsRepository.delete({
            postId,
            userId: plan.userId,
          });
          return (result.affected ?? 0) === 1;
        }

        const result = await postReactionsRepository.update(
          { postId, userId: plan.userId },
          {
            likeStatus: plan.likeStatus,
            createdAt: new Date(plan.createdAt),
            userLogin: userLogin ?? '',
          },
        );
        return (result.affected ?? 0) === 1;
      });
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
