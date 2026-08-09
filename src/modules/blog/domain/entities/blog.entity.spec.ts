import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { BlogDb, BlogEntity } from './blog.entity';

describe('BlogEntity', () => {
  const baseDb = (overrides: Partial<BlogDb> = {}): BlogDb => ({
    id: 'blog-1',
    name: 'Blog',
    websiteUrl: 'https://example.com',
    description: 'desc',
    isMembership: false,
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    ...overrides,
  });

  it('creates blog with default membership false', () => {
    const blog = BlogEntity.create({
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
    });

    const db = blog.toDb();
    expect(db.name).toBe('Blog');
    expect(db.isMembership).toBe(false);
    expect(blog.id).toEqual(expect.any(String));
  });

  it('reconstitutes and normalizes createdAt from string', () => {
    const blog = BlogEntity.reconstitute({
      ...baseDb(),
      createdAt: '2021-01-01T00:00:00.000Z' as unknown as Date,
    });

    expect(blog.toDb().createdAt).toEqual(new Date('2021-01-01T00:00:00.000Z'));
  });

  it('ensureNameIsUnique allows same id and null conflict', () => {
    const blog = BlogEntity.reconstitute(baseDb());

    expect(() => blog.ensureNameIsUnique(null)).not.toThrow();
    expect(() => blog.ensureNameIsUnique(undefined)).not.toThrow();
    expect(() => blog.ensureNameIsUnique('blog-1')).not.toThrow();
  });

  it('ensureNameIsUnique throws when another blog has same name', () => {
    const blog = BlogEntity.reconstitute(baseDb());

    expect(() => blog.ensureNameIsUnique('other-id')).toThrow(DomainException);
    try {
      blog.ensureNameIsUnique('other-id');
    } catch (e) {
      expect(e).toMatchObject({
        code: DomainExceptionCode.BadRequest,
        extensions: [{ field: 'name' }],
      });
    }
  });

  it('updates blog fields', () => {
    const blog = BlogEntity.reconstitute(baseDb());

    blog.update({
      name: 'New',
      websiteUrl: 'https://new.com',
      description: 'new desc',
    });

    expect(blog.toDb()).toMatchObject({
      name: 'New',
      websiteUrl: 'https://new.com',
      description: 'new desc',
    });
  });
});
