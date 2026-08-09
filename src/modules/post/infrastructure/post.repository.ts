import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { runWithTransactionRetry } from '@/core/typeorm/run-with-transaction-retry';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';
import { ReactionUpdateService } from '@/modules/like/application/services/reaction-update.service';
import { LikeStatus } from '@/modules/like/types/like-status';
import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

import { PostEntity } from '../domain/entities/post.entity';
import { PostReactionOrmEntity } from './post-reaction.orm-entity';
import { reactionToDomain } from './post.mapper';
import { PostOrmEntity } from './post.orm-entity';
import { PostPersistenceMapper } from './post.persistence-mapper';

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
    @InjectRepository(PostReactionOrmEntity)
    private readonly postReactionsRepository: Repository<PostReactionOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly reactionUpdateService: ReactionUpdateService,
    private readonly internalIdResolver: InternalIdResolver,
  ) {}

  async createPost(newPost: PostEntity): Promise<PostEntity | null> {
    try {
      const data = newPost.toDb();
      const entity = PostPersistenceMapper.toPersistence(newPost);
      entity.blogId = await this.internalIdResolver.resolveBlogId(data.blogId);
      const saved = await this.postsRepository.save(entity);
      return PostPersistenceMapper.toDomain(saved, { blogId: data.blogId });
    } catch (error) {
      console.log(`postsRepository.createPost error is occurred: ${error}`);
      return null;
    }
  }

  async findById(id: string): Promise<PostEntity | null> {
    const entity = await this.postsRepository.findOne({ where: { publicId: id } });
    if (!entity) return null;
    const blogPublicId = await this.internalIdResolver.lookupBlogPublicId(entity.blogId);
    if (!blogPublicId) return null;
    return PostPersistenceMapper.toDomain(entity, { blogId: blogPublicId });
  }

  async save(post: PostEntity): Promise<boolean> {
    const data = post.toDb();
    const blogInternalId = await this.internalIdResolver.resolveBlogId(data.blogId);
    const result = await this.postsRepository.update(
      { publicId: data.id },
      {
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
        blogId: blogInternalId,
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
      return await runWithTransactionRetry(() =>
        this.dataSource.transaction(async (manager) => {
          const postsRepository = manager.getRepository(PostOrmEntity);
          const postReactionsRepository = manager.getRepository(PostReactionOrmEntity);

          const postInternalId = await this.internalIdResolver.resolvePostId(postId, manager);
          const userInternalId = await this.internalIdResolver.resolveUserId(userId, manager);

          const postEntity = await postsRepository
            .createQueryBuilder('post')
            .setLock('pessimistic_write')
            .where('post.id = :id', { id: postInternalId })
            .getOne();
          if (!postEntity) return false;

          const existingReactionEntity = await postReactionsRepository
            .createQueryBuilder('reaction')
            .setLock('pessimistic_write')
            .where('reaction.postId = :postId', { postId: postInternalId })
            .andWhere('reaction.userId = :userId', { userId: userInternalId })
            .getOne();
          const reactions = existingReactionEntity
            ? [reactionToDomain(existingReactionEntity, userId)]
            : [];

          let plan = this.reactionUpdateService.planReactionUpdate({
            reactions,
            userId,
            likeStatus,
          });

          let userLogin: string | null = null;
          if (plan.action === 'push' || plan.action === 'update') {
            const usersRepository = manager.getRepository(UserOrmEntity);
            const userEntity = await usersRepository.findOne({
              where: { id: userInternalId },
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
            const reaction = new PostReactionOrmEntity();
            reaction.postId = postInternalId;
            reaction.userId = userInternalId;
            reaction.userLogin = plan.reaction.userLogin ?? userLogin ?? '';
            reaction.likeStatus = plan.reaction.likeStatus;
            reaction.createdAt = new Date(plan.reaction.createdAt);
            await postReactionsRepository.save(reaction);
            return true;
          }

          if (plan.action === 'pull') {
            const result = await postReactionsRepository.delete({
              postId: postInternalId,
              userId: userInternalId,
            });
            return (result.affected ?? 0) === 1;
          }

          const result = await postReactionsRepository.update(
            { postId: postInternalId, userId: userInternalId },
            {
              likeStatus: plan.likeStatus,
              createdAt: new Date(plan.createdAt),
              userLogin: userLogin ?? '',
            },
          );
          return (result.affected ?? 0) === 1;
        }),
      );
    } catch (error) {
      console.log('postsRepository.updatePostLikeStatus error is occurred: ', error);
      return false;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.postsRepository.delete({ publicId: id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`postsRepository.deletePostById error is occurred: ${error}`);
      return false;
    }
  }
}
