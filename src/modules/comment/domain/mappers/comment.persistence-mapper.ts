import { CommentOrmEntity } from '../../infrastructure/comment.orm-entity';
import { CommentEntity } from '../entities/comment.entity';

export const CommentPersistenceMapper = {
  toDomain(raw: CommentOrmEntity): CommentEntity {
    return CommentEntity.reconstitute(raw);
  },

  toPersistence(entity: CommentEntity): CommentOrmEntity {
    const data = entity.toDb();
    const orm = new CommentOrmEntity();
    orm.id = data.id;
    orm.postId = data.postId;
    orm.content = data.content;
    orm.userId = data.userId;
    orm.userLogin = data.userLogin;
    orm.createdAt = data.createdAt;
    return orm;
  },
};
