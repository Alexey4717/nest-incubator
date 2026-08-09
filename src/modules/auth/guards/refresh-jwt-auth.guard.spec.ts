import { ExecutionContext } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { RefreshJwtAuthGuard } from './refresh-jwt-auth.guard';

describe('RefreshJwtAuthGuard', () => {
  const guard = new RefreshJwtAuthGuard();

  const createContext = () => {
    const request: {
      user?: unknown;
      refreshTokenJWTPayload?: unknown;
    } = {};
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  };

  it('attaches user and refresh payload on success', () => {
    const { context, request } = createContext();
    const result = {
      userId: 'u1',
      payload: {
        userId: 'u1',
        deviceId: 'd1',
        jti: 'jti-1',
        iat: 1,
      },
    };

    const user = guard.handleRequest(null, result, null, context);

    expect(user).toEqual({ userId: 'u1', deviceId: 'd1' });
    expect(request.user).toEqual({ userId: 'u1', deviceId: 'd1' });
    expect(request.refreshTokenJWTPayload).toEqual(result.payload);
  });

  it('rethrows original error when present', () => {
    const { context } = createContext();
    const err = new Error('invalid refresh');
    expect(() => guard.handleRequest(err, false, null, context)).toThrow(err);
  });

  it('throws Unauthorized when result is missing', () => {
    const { context } = createContext();
    expect(() => guard.handleRequest(null, null, null, context)).toThrow(DomainException);
    expect(() => guard.handleRequest(null, false, null, context)).toThrow(
      expect.objectContaining({ code: DomainExceptionCode.Unauthorized }),
    );
  });
});
