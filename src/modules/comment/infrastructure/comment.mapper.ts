import { CommentEntity } from '../domain/entities/comment.entity';
import { CommentModel, CommentReactionModel } from '../models/comment.model';
import { CommentReactionOrmEntity } from './comment-reaction.orm-entity';

export function reactionToDomain(
  reaction: CommentReactionOrmEntity,
  userPublicId: string,
): CommentReactionModel {
  return {
    userId: userPublicId,
    likeStatus: reaction.likeStatus,
    createdAt: reaction.createdAt.toISOString(),
  };
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
