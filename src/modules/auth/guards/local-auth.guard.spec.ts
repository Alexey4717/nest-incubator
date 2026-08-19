import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;
  let canActivateSpy: jest.SpyInstance;

  const createContext = (body: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ body }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new LocalAuthGuard();
    canActivateSpy = jest
      .spyOn(AuthGuard('local').prototype, 'canActivate')
      .mockResolvedValue(true);
  });

  afterEach(() => {
    canActivateSpy.mockRestore();
  });

  it('throws ValidationError when body is invalid', async () => {
    await expect(guard.canActivate(createContext({}))).rejects.toThrow(DomainException);
    await expect(guard.canActivate(createContext({ loginOrEmail: '' }))).rejects.toMatchObject({
      code: DomainExceptionCode.ValidationError,
    });
    expect(canActivateSpy).not.toHaveBeenCalled();
  });

  it('collects all invalid DTO fields in one ValidationError', async () => {
    try {
      await guard.canActivate(createContext({ loginOrEmail: '', password: '' }));
      fail('expected DomainException');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException);
      expect(error).toMatchObject({
        code: DomainExceptionCode.ValidationError,
        extensions: expect.arrayContaining([
          expect.objectContaining({ field: 'loginOrEmail' }),
          expect.objectContaining({ field: 'password' }),
        ]),
      });
    }
    expect(canActivateSpy).not.toHaveBeenCalled();
  });

  it('delegates to passport when body is valid', async () => {
    const context = createContext({
      loginOrEmail: 'user@example.com',
      password: 'password123',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(canActivateSpy).toHaveBeenCalledWith(context);
  });
});
