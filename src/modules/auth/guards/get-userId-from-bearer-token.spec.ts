import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GetUserIdFromBearerToken } from './get-userId-from-bearer-token';

describe('GetUserIdFromBearerToken', () => {
  const createContext = (authorization?: string) => {
    const request: { headers: { authorization?: string }; user?: unknown } = {
      headers: { authorization },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  };

  it('sets user to null when Authorization header is missing', () => {
    const jwtService = { decode: jest.fn() } as unknown as JwtService;
    const guard = new GetUserIdFromBearerToken(jwtService);
    const { context, request } = createContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toBeNull();
    expect(jwtService.decode).not.toHaveBeenCalled();
  });

  it('sets user to null for non-Bearer or empty token', () => {
    const jwtService = { decode: jest.fn() } as unknown as JwtService;
    const guard = new GetUserIdFromBearerToken(jwtService);

    const basic = createContext('Basic abc');
    expect(guard.canActivate(basic.context)).toBe(true);
    expect(basic.request.user).toBeNull();

    const emptyBearer = createContext('Bearer');
    expect(guard.canActivate(emptyBearer.context)).toBe(true);
    expect(emptyBearer.request.user).toBeNull();
  });

  it('sets user to null when token payload has no userId', () => {
    const jwtService = {
      decode: jest.fn().mockReturnValue({ deviceId: 'd1' }),
    } as unknown as JwtService;
    const guard = new GetUserIdFromBearerToken(jwtService);
    const { context, request } = createContext('Bearer token');

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toBeNull();
  });

  it('sets userId from valid Bearer token payload', () => {
    const jwtService = {
      decode: jest.fn().mockReturnValue({ userId: 'user-1' }),
    } as unknown as JwtService;
    const guard = new GetUserIdFromBearerToken(jwtService);
    const { context, request } = createContext('Bearer token');

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ userId: 'user-1' });
  });
});
