import { PostModel, PostReactionModel } from '../models/post.model';
import { PostReactionEntity } from './post-reaction.entity';
import { PostEntity } from './post.entity';

export function reactionToDomain(reaction: PostReactionEntity): PostReactionModel {
  return {
    userId: reaction.userId,
    userLogin: reaction.userLogin,
    likeStatus: reaction.likeStatus,
    createdAt: reaction.createdAt.toISOString(),
  };
}

export function toDomain(entity: PostEntity, reactions: PostReactionEntity[] = []): PostModel {
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

export function toOrm(model: PostModel): PostEntity {
  const entity = new PostEntity();
  entity.id = model.id;
  entity.title = model.title;
  entity.shortDescription = model.shortDescription;
  entity.content = model.content;
  entity.blogId = model.blogId;
  entity.blogName = model.blogName;
  entity.createdAt = new Date(model.createdAt);
  return entity;
}
