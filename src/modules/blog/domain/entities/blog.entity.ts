import { randomUUID } from 'crypto';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';

import { BlogOrmEntity } from '../../infrastructure/blog.orm-entity';

export type BlogCreateProps = {
  name: string;
  websiteUrl: string;
  description: string;
};

export type BlogUpdateProps = {
  name: string;
  websiteUrl: string;
  description: string;
};

export type BlogDb = {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  isMembership: boolean;
  createdAt: Date;
};

export class BlogEntity {
  private constructor(private data: BlogDb) {}

  static create(props: BlogCreateProps): BlogEntity {
    return new BlogEntity({
      id: randomUUID(),
      name: props.name,
      websiteUrl: props.websiteUrl,
      description: props.description,
      isMembership: false,
      createdAt: new Date(),
    });
  }

  static reconstitute(raw: BlogOrmEntity | BlogDb): BlogEntity {
    return new BlogEntity({
      id: raw.id,
      name: raw.name,
      websiteUrl: raw.websiteUrl,
      description: raw.description,
      isMembership: raw.isMembership,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt),
    });
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  toDb(): BlogDb {
    return { ...this.data };
  }

  ensureNameIsUnique(conflictingBlogId: string | null | undefined): void {
    if (conflictingBlogId && conflictingBlogId !== this.id) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'This name already exists', field: 'name' },
      ]);
    }
  }

  update(props: BlogUpdateProps): void {
    this.data = { ...this.data, ...props };
  }
}
