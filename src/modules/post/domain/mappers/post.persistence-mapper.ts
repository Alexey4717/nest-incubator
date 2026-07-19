import { PostOrmEntity } from '../../infrastructure/post.orm-entity';
import { PostEntity } from '../entities/post.entity';

export const PostPersistenceMapper = {
  toDomain(raw: PostOrmEntity): PostEntity {
    return PostEntity.reconstitute(raw);
  },

  toPersistence(entity: PostEntity): PostOrmEntity {
    const data = entity.toDb();
    const orm = new PostOrmEntity();
    orm.id = data.id;
    orm.title = data.title;
    orm.shortDescription = data.shortDescription;
    orm.content = data.content;
    orm.blogId = data.blogId;
    orm.blogName = data.blogName;
    orm.createdAt = data.createdAt;
    return orm;
  },
};
