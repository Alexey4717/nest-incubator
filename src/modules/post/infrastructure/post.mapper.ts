import { PostEntity } from '../domain/entities/post.entity';
import { PostModel, PostReactionModel } from '../models/post.model';
import { PostReactionOrmEntity } from './post-reaction.orm-entity';
import { PostOrmEntity } from './post.orm-entity';

export function reactionToDomain(
  reaction: PostReactionOrmEntity,
  userPublicId: string,
): PostReactionModel {
  return {
    userId: userPublicId,
    userLogin: reaction.userLogin,
    likeStatus: reaction.likeStatus,
    createdAt: reaction.createdAt.toISOString(),
  };
}

export function toDomain(
  entity: PostOrmEntity,
  reactions: PostReactionOrmEntity[] = [],
): PostModel {
  return {
    id: entity.publicId,
    title: entity.title,
    shortDescription: entity.shortDescription,
    content: entity.content,
    blogId: entity.blogId,
    blogName: entity.blogName,
    createdAt: entity.createdAt.toISOString(),
    reactions: reactions.map((reaction) => reactionToDomain(reaction, reaction.userId)),
  };
}

type PostReactionRaw = {
  userId: string;
  userLogin: string;
  likeStatus: PostReactionModel['likeStatus'];
  createdAt: Date | string;
};

export type PostRawRow = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  reactions: PostReactionRaw[];
};

const toIsoString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : String(value);

export function fromRaw(row: PostRawRow): PostModel {
  const reactions = Array.isArray(row.reactions) ? row.reactions : [];

  return {
    id: row.id,
    title: row.title,
    shortDescription: row.shortDescription,
    content: row.content,
    blogId: row.blogId,
    blogName: row.blogName,
    createdAt: toIsoString(row.createdAt),
    reactions: reactions.map((reaction) => ({
      userId: reaction.userId,
      userLogin: reaction.userLogin,
      likeStatus: reaction.likeStatus,
      createdAt: toIsoString(reaction.createdAt),
    })),
  };
}

export function fromEntity(entity: PostEntity, reactions: PostReactionModel[] = []): PostModel {
  const data = entity.toDb();
  return {
    id: data.id,
    title: data.title,
    shortDescription: data.shortDescription,
    content: data.content,
    blogId: data.blogId,
    blogName: data.blogName,
    createdAt: data.createdAt.toISOString(),
    reactions,
  };
}
