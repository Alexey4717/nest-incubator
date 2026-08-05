import { CommentOrmEntity } from '../../infrastructure/comment.orm-entity';
import { CommentEntity } from '../entities/comment.entity';

export type CommentFkPublicIds = {
  postId: string;
  userId: string;
};

export const CommentPersistenceMapper = {
  toDomain(raw: CommentOrmEntity, fkPublicIds: CommentFkPublicIds): CommentEntity {
    return CommentEntity.reconstitute({
      id: raw.publicId,
      postId: fkPublicIds.postId,
      content: raw.content,
      userId: fkPublicIds.userId,
      userLogin: raw.userLogin,
      createdAt: raw.createdAt,
      likesCount: 0,
      dislikesCount: 0,
    });
  },

  toPersistence(entity: CommentEntity): CommentOrmEntity {
    const data = entity.toDb();
    const orm = new CommentOrmEntity();
    orm.publicId = data.id;
    orm.content = data.content;
    orm.userLogin = data.userLogin;
    orm.createdAt = data.createdAt;
    return orm;
  },
};
