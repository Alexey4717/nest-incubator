import { BlogEntity } from '../domain/entities/blog.entity';
import { BlogOrmEntity } from './blog.orm-entity';

export const BlogPersistenceMapper = {
  toDomain(raw: BlogOrmEntity): BlogEntity {
    return BlogEntity.reconstitute({
      id: raw.publicId,
      name: raw.name,
      websiteUrl: raw.websiteUrl,
      description: raw.description,
      isMembership: raw.isMembership,
      createdAt: raw.createdAt,
    });
  },

  toPersistence(entity: BlogEntity): BlogOrmEntity {
    const data = entity.toDb();
    const orm = new BlogOrmEntity();
    orm.publicId = data.id;
    orm.name = data.name;
    orm.websiteUrl = data.websiteUrl;
    orm.description = data.description;
    orm.isMembership = data.isMembership;
    orm.createdAt = data.createdAt;
    return orm;
  },
};
