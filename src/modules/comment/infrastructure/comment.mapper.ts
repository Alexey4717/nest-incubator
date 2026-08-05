import { CommentEntity } from '../domain/entities/comment.entity';
import { CommentModel, CommentReactionModel } from '../models/comment.model';
import { CommentReactionEntity } from './comment-reaction.entity';
import { CommentOrmEntity } from './comment.orm-entity';

export function reactionToDomain(
  reaction: CommentReactionEntity,
  userPublicId: string,
): CommentReactionModel {
  return {
    userId: userPublicId,
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
  fkPublicIds?: { postId: string; userId: string },
): CommentModel {
  return {
    id: entity.publicId,
    postId: fkPublicIds?.postId ?? entity.postId,
    content: entity.content,
    commentatorInfo: {
      userId: fkPublicIds?.userId ?? entity.userId,
      userLogin: entity.userLogin,
    },
    createdAt: entity.createdAt.toISOString(),
    reactions: reactions.map((reaction) =>
      reactionToDomain(reaction, fkPublicIds?.userId ?? reaction.userId),
    ),
  };
}

export function toOrm(model: CommentModel): CommentOrmEntity {
  const entity = new CommentOrmEntity();
  entity.publicId = model.id;
  entity.postId = model.postId;
  entity.content = model.content;
  entity.userId = model.commentatorInfo.userId;
  entity.userLogin = model.commentatorInfo.userLogin;
  entity.createdAt = new Date(model.createdAt);
  return entity;
}

type CommentReactionRaw = {
  userId: string;
  likeStatus: CommentReactionModel['likeStatus'];
  createdAt: Date | string;
};

export type CommentRawRow = {
  id: string;
  postId: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  reactions: CommentReactionRaw[];
};

const toIsoString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : String(value);

export function fromRaw(row: CommentRawRow): CommentModel {
  const reactions = Array.isArray(row.reactions) ? row.reactions : [];

  return {
    id: row.id,
    postId: row.postId,
    content: row.content,
    commentatorInfo: { userId: row.userId, userLogin: row.userLogin },
    createdAt: toIsoString(row.createdAt),
    reactions: reactions.map((reaction) => ({
      userId: reaction.userId,
      likeStatus: reaction.likeStatus,
      createdAt: toIsoString(reaction.createdAt),
    })),
  };
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
