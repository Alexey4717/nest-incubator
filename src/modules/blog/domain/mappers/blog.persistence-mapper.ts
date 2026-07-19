import { BlogOrmEntity } from '../../infrastructure/blog.orm-entity';
import { BlogEntity } from '../entities/blog.entity';

export const BlogPersistenceMapper = {
  toDomain(raw: BlogOrmEntity): BlogEntity {
    return BlogEntity.reconstitute(raw);
  },

  toPersistence(entity: BlogEntity): BlogOrmEntity {
    const data = entity.toDb();
    const orm = new BlogOrmEntity();
    orm.id = data.id;
    orm.name = data.name;
    orm.websiteUrl = data.websiteUrl;
    orm.description = data.description;
    orm.isMembership = data.isMembership;
    orm.createdAt = data.createdAt;
    return orm;
  },
};
