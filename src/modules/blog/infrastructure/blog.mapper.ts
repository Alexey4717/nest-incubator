import { BlogDb, BlogEntity } from '../domain/entities/blog.entity';
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

export function toOrm(model: BlogModel): BlogOrmEntity {
  const entity = new BlogOrmEntity();
  entity.publicId = model.id;
  entity.name = model.name;
  entity.websiteUrl = model.websiteUrl;
  entity.description = model.description;
  entity.isMembership = model.isMembership ?? false;
  entity.createdAt = new Date(model.createdAt);
  return entity;
}

export function modelToDb(model: BlogModel): BlogDb {
  return {
    id: model.id,
    name: model.name,
    websiteUrl: model.websiteUrl,
    description: model.description,
    isMembership: model.isMembership,
    createdAt: new Date(model.createdAt),
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
