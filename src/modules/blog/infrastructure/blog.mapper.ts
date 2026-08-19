import { BlogEntity } from '../domain/entities/blog.entity';
import { BlogModel } from '../models/blog.model';
import { BlogOrmEntity } from './blog.orm-entity';

export function toDomain(entity: BlogOrmEntity): BlogModel {
  return {
    id: entity.publicId,
    name: entity.name,
    websiteUrl: entity.websiteUrl,
    description: entity.description,
    isMembership: entity.isMembership,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function fromEntity(entity: BlogEntity): BlogModel {
  const data = entity.toDb();
  return {
    id: data.id,
    name: data.name,
    websiteUrl: data.websiteUrl,
    description: data.description,
    isMembership: data.isMembership,
    createdAt: data.createdAt.toISOString(),
  };
}
