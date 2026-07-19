import { CommentEntity } from '../domain/entities/comment.entity';
import { CommentModel, CommentReactionModel } from '../models/comment.model';
import { CommentReactionEntity } from './comment-reaction.entity';
import { CommentOrmEntity } from './comment.orm-entity';

export function reactionToDomain(reaction: CommentReactionEntity): CommentReactionModel {
  return {
    userId: reaction.userId,
    likeStatus: reaction.likeStatus,
    createdAt: reaction.createdAt.toISOString(),
  };
}

export function reactionToOrm(
  commentId: string,
  reaction: CommentReactionModel,
): CommentReactionEntity {
  const entity = new CommentReactionEntity();
  entity.commentId = commentId;
  entity.userId = reaction.userId;
  entity.likeStatus = reaction.likeStatus;
  entity.createdAt = new Date(reaction.createdAt);
  return entity;
}

export function toDomain(
  entity: CommentOrmEntity,
  reactions: CommentReactionEntity[] = [],
): CommentModel {
  return {
    id: entity.id,
    postId: entity.postId,
    content: entity.content,
    commentatorInfo: { userId: entity.userId, userLogin: entity.userLogin },
    createdAt: entity.createdAt.toISOString(),
    reactions: reactions.map(reactionToDomain),
  };
}

export function toOrm(model: CommentModel): CommentOrmEntity {
  const entity = new CommentOrmEntity();
  entity.id = model.id;
  entity.postId = model.postId;
  entity.content = model.content;
  entity.userId = model.commentatorInfo.userId;
  entity.userLogin = model.commentatorInfo.userLogin;
  entity.createdAt = new Date(model.createdAt);
  return entity;
}

export function fromEntity(
  entity: CommentEntity,
  reactions: CommentReactionModel[] = [],
): CommentModel {
  const data = entity.toDb();
  return {
    id: data.id,
    postId: data.postId,
    content: data.content,
    commentatorInfo: { userId: data.userId, userLogin: data.userLogin },
    createdAt: data.createdAt.toISOString(),
    reactions,
  };
}
