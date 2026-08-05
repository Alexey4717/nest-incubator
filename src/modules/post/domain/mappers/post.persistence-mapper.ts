import { PostOrmEntity } from '../../infrastructure/post.orm-entity';
import { PostEntity } from '../entities/post.entity';

export type PostFkPublicIds = {
  blogId: string;
};

export const PostPersistenceMapper = {
  toDomain(raw: PostOrmEntity, fkPublicIds: PostFkPublicIds): PostEntity {
    return PostEntity.reconstitute({
      id: raw.publicId,
      title: raw.title,
      shortDescription: raw.shortDescription,
      content: raw.content,
      blogId: fkPublicIds.blogId,
      blogName: raw.blogName,
      createdAt: raw.createdAt,
      likesCount: 0,
      dislikesCount: 0,
    });
  },

  toPersistence(entity: PostEntity): PostOrmEntity {
    const data = entity.toDb();
    const orm = new PostOrmEntity();
    orm.publicId = data.id;
    orm.title = data.title;
    orm.shortDescription = data.shortDescription;
    orm.content = data.content;
    orm.blogName = data.blogName;
    orm.createdAt = data.createdAt;
    return orm;
  },
};
