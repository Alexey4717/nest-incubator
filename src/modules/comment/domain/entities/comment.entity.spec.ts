import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { CommentDb, CommentEntity } from './comment.entity';

describe('CommentEntity', () => {
  const baseDb = (overrides: Partial<CommentDb> = {}): CommentDb => ({
    id: 'comment-1',
    postId: 'post-1',
    content: 'hello',
    userId: 'user-1',
    userLogin: 'login',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    likesCount: 0,
    dislikesCount: 0,
    ...overrides,
  });

  it('creates comment with zero likes', () => {
    const comment = CommentEntity.create({
      postId: 'post-1',
      userId: 'user-1',
      userLogin: 'login',
      content: 'hello',
    });

    const db = comment.toDb();
    expect(db.postId).toBe('post-1');
    expect(db.content).toBe('hello');
    expect(db.likesCount).toBe(0);
    expect(db.dislikesCount).toBe(0);
    expect(comment.id).toEqual(expect.any(String));
  });

  it('reconstitutes and normalizes createdAt from string', () => {
    const comment = CommentEntity.reconstitute({
      ...baseDb(),
      createdAt: '2021-01-01T00:00:00.000Z' as unknown as Date,
    });

    expect(comment.toDb().createdAt).toEqual(new Date('2021-01-01T00:00:00.000Z'));
  });

  it('allows owner to modify and forbids others', () => {
    const comment = CommentEntity.reconstitute(baseDb());

    expect(() => comment.canBeModifiedBy('user-1')).not.toThrow();
    expect(() => comment.canBeModifiedBy('other')).toThrow(DomainException);
    try {
      comment.canBeModifiedBy('other');
    } catch (e) {
      expect((e as DomainException).code).toBe(DomainExceptionCode.Forbidden);
    }
  });

  it('updates content and applies like counts', () => {
    const comment = CommentEntity.reconstitute(baseDb());

    comment.update('updated');
    comment.applyLikeCounts({ likesCount: 2, dislikesCount: 1 });

    expect(comment.toDb()).toMatchObject({
      content: 'updated',
      likesCount: 2,
      dislikesCount: 1,
    });
  });
});
