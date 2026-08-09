import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { AccessJwtAuthGuard } from './access-jwt-auth.guard';

describe('AccessJwtAuthGuard', () => {
  const guard = new AccessJwtAuthGuard();

  it('returns authenticated user on success', () => {
    const user = { userId: 'u1', deviceId: 'd1' };
    expect(guard.handleRequest(null, user, null)).toEqual(user);
  });

  it('rethrows original error when present', () => {
    const err = new Error('jwt expired');
    expect(() => guard.handleRequest(err, false, null)).toThrow(err);
  });

  it('throws Unauthorized when user is missing', () => {
    expect(() => guard.handleRequest(null, false, null)).toThrow(DomainException);
    expect(() => guard.handleRequest(null, null, null)).toThrow(
      expect.objectContaining({ code: DomainExceptionCode.Unauthorized }),
    );
  });
});
