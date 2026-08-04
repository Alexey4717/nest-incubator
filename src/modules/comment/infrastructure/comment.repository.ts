import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

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
  ) {}

  async findById(id: string): Promise<CommentEntity | null> {
    const entity = await this.commentsRepository.findOne({ where: { id } });
    return entity ? CommentPersistenceMapper.toDomain(entity) : null;
  }

  async createCommentInPost(newComment: CommentEntity): Promise<boolean> {
    try {
      const entity = CommentPersistenceMapper.toPersistence(newComment);
      await this.commentsRepository.save(entity);
      return true;
    } catch (error) {
      console.log('commentsRepository.createCommentInPost error is occurred: ', error);
      return false;
    }
  }

  async save(comment: CommentEntity): Promise<boolean> {
    const data = comment.toDb();
    const result = await this.commentsRepository.update({ id: data.id }, { content: data.content });
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

        const commentExists = await commentsRepository.exists({ where: { id: commentId } });
        if (!commentExists) return false;

        const existingReactionEntity = await commentReactionsRepository.findOne({
          where: { commentId, userId },
        });
        const reactions = existingReactionEntity ? [reactionToDomain(existingReactionEntity)] : [];

        const plan = this.reactionUpdateService.planReactionUpdate({
          reactions,
          userId,
          likeStatus,
        });

        if (plan.action === 'noop') return true;

        if (plan.action === 'push') {
          const reaction = new CommentReactionEntity();
          reaction.commentId = commentId;
          reaction.userId = plan.reaction.userId;
          reaction.likeStatus = plan.reaction.likeStatus;
          reaction.createdAt = new Date(plan.reaction.createdAt);
          await commentReactionsRepository.save(reaction);
          return true;
        }

        if (plan.action === 'pull') {
          const result = await commentReactionsRepository.delete({
            commentId,
            userId: plan.userId,
          });
          return (result.affected ?? 0) === 1;
        }

        const result = await commentReactionsRepository.update(
          { commentId, userId: plan.userId },
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
      const result = await this.commentsRepository.delete({ id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log('commentsRepository.deleteCommentById error is occurred: ', error);
      return false;
    }
  }
}
