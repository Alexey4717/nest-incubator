import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { InternalIdResolver } from '@/modules/database/internal-id.resolver';
import { ReactionUpdateService } from '@/modules/like/application/services/reaction-update.service';
import { LikeStatus } from '@/modules/like/types/like-status';

import { CommentEntity } from '../domain/entities/comment.entity';
import { CommentPersistenceMapper } from '../domain/mappers/comment.persistence-mapper';
import { CommentReactionEntity } from './comment-reaction.entity';
import { reactionToDomain } from './comment.mapper';
import { CommentOrmEntity } from './comment.orm-entity';

export interface UpdateCommentLikeStatusArgs {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentsRepository: Repository<CommentOrmEntity>,
    @InjectRepository(CommentReactionEntity)
    private readonly commentReactionsRepository: Repository<CommentReactionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly reactionUpdateService: ReactionUpdateService,
    private readonly internalIdResolver: InternalIdResolver,
  ) {}

  async findById(id: string): Promise<CommentEntity | null> {
    const entity = await this.commentsRepository.findOne({ where: { publicId: id } });
    if (!entity) return null;
    const [postPublicId, userPublicId] = await Promise.all([
      this.internalIdResolver.lookupPostPublicId(entity.postId),
      this.internalIdResolver.lookupUserPublicId(entity.userId),
    ]);
    if (!postPublicId || !userPublicId) return null;
    return CommentPersistenceMapper.toDomain(entity, {
      postId: postPublicId,
      userId: userPublicId,
    });
  }

  async createCommentInPost(newComment: CommentEntity): Promise<boolean> {
    try {
      const data = newComment.toDb();
      const entity = CommentPersistenceMapper.toPersistence(newComment);
      entity.postId = await this.internalIdResolver.resolvePostId(data.postId);
      entity.userId = await this.internalIdResolver.resolveUserId(data.userId);
      await this.commentsRepository.save(entity);
      return true;
    } catch (error) {
      console.log('commentsRepository.createCommentInPost error is occurred: ', error);
      return false;
    }
  }

  async save(comment: CommentEntity): Promise<boolean> {
    const data = comment.toDb();
    const result = await this.commentsRepository.update(
      { publicId: data.id },
      { content: data.content },
    );
    return (result.affected ?? 0) === 1;
  }

  async updateCommentLikeStatusByCommentId({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusArgs): Promise<boolean> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const commentsRepository = manager.getRepository(CommentOrmEntity);
        const commentReactionsRepository = manager.getRepository(CommentReactionEntity);

        const commentEntity = await commentsRepository.findOne({ where: { publicId: commentId } });
        if (!commentEntity) return false;

        const resolvedCommentId = commentEntity.id;
        const userInternalId = await this.internalIdResolver.resolveUserId(userId);

        const existingReactionEntity = await commentReactionsRepository.findOne({
          where: { commentId: resolvedCommentId, userId: userInternalId },
        });
        const reactions = existingReactionEntity
          ? [reactionToDomain(existingReactionEntity, userId)]
          : [];

        const plan = this.reactionUpdateService.planReactionUpdate({
          reactions,
          userId,
          likeStatus,
        });

        if (plan.action === 'noop') return true;

        if (plan.action === 'push') {
          const reaction = new CommentReactionEntity();
          reaction.commentId = resolvedCommentId;
          reaction.userId = userInternalId;
          reaction.likeStatus = plan.reaction.likeStatus;
          reaction.createdAt = new Date(plan.reaction.createdAt);
          await commentReactionsRepository.save(reaction);
          return true;
        }

        if (plan.action === 'pull') {
          const result = await commentReactionsRepository.delete({
            commentId: resolvedCommentId,
            userId: userInternalId,
          });
          return (result.affected ?? 0) === 1;
        }

        const result = await commentReactionsRepository.update(
          { commentId: resolvedCommentId, userId: userInternalId },
          {
            likeStatus: plan.likeStatus,
            createdAt: new Date(plan.createdAt),
          },
        );
        return (result.affected ?? 0) === 1;
      });
    } catch (error) {
      console.log(
        'commentsRepository.updateCommentLikeStatusByCommentId error is occurred: ',
        error,
      );
      return false;
    }
  }

  async deleteCommentById(id: string): Promise<boolean> {
    try {
      const result = await this.commentsRepository.delete({ publicId: id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log('commentsRepository.deleteCommentById error is occurred: ', error);
      return false;
    }
  }
}
