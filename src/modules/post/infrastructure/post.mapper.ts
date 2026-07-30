import { PostEntity } from '../domain/entities/post.entity';
import { PostModel, PostReactionModel } from '../models/post.model';
import { PostReactionEntity } from './post-reaction.entity';
import { PostOrmEntity } from './post.orm-entity';

export function reactionToDomain(reaction: PostReactionEntity): PostReactionModel {
  return {
    userId: reaction.userId,
    userLogin: reaction.userLogin,
    likeStatus: reaction.likeStatus,
    createdAt: reaction.createdAt.toISOString(),
  };
}

export function toDomain(entity: PostOrmEntity, reactions: PostReactionEntity[] = []): PostModel {
  return {
    id: entity.id,
    title: entity.title,
    shortDescription: entity.shortDescription,
    content: entity.content,
    blogId: entity.blogId,
    blogName: entity.blogName,
    createdAt: entity.createdAt.toISOString(),
    reactions: reactions.map(reactionToDomain),
  };
}

export function toOrm(model: PostModel): PostOrmEntity {
  const entity = new PostOrmEntity();
  entity.id = model.id;
  entity.title = model.title;
  entity.shortDescription = model.shortDescription;
  entity.content = model.content;
  entity.blogId = model.blogId;
  entity.blogName = model.blogName;
  entity.createdAt = new Date(model.createdAt);
  return entity;
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
