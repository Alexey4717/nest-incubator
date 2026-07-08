import { BlogModel } from '../models/blog.model';
import { BlogEntity } from './blog.entity';

export function toDomain(entity: BlogEntity): BlogModel {
  return {
    id: entity.id,
    name: entity.name,
    websiteUrl: entity.websiteUrl,
    description: entity.description,
    isMembership: entity.isMembership,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toOrm(model: BlogModel): BlogEntity {
  const entity = new BlogEntity();
  entity.id = model.id;
  entity.name = model.name;
  entity.websiteUrl = model.websiteUrl;
  entity.description = model.description;
  entity.isMembership = model.isMembership ?? false;
  entity.createdAt = new Date(model.createdAt);
  return entity;
}
