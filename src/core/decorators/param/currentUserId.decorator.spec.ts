import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { CurrentDeviceId } from './currentDeviceId.decorator';
import { CurrentUserId } from './currentUserId.decorator';
import { RefreshToken } from './refresh-token.decorator';
import { UserAgent } from './user-agent.decorator';

type ParamDecorator = () => ParameterDecorator;

function getParamDecoratorFactory(decorator: ParamDecorator) {
  class TestDecorator {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public handler(@decorator() _value: unknown) {
      return undefined;
    }
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestDecorator, 'handler');
  return args[Object.keys(args)[0]].factory as (data: unknown, ctx: ExecutionContext) => unknown;
}

describe('param decorators', () => {
  const createContext = (request: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('CurrentUserId returns userId or null', () => {
    const factory = getParamDecoratorFactory(CurrentUserId as ParamDecorator);
    expect(factory(undefined, createContext({ user: { userId: 'u1' } }))).toBe('u1');
    expect(factory(undefined, createContext({ user: null }))).toBeNull();
  });

  it('CurrentDeviceId returns deviceId or null', () => {
    const factory = getParamDecoratorFactory(CurrentDeviceId as ParamDecorator);
    expect(factory(undefined, createContext({ user: { deviceId: 'd1' } }))).toBe('d1');
    expect(factory(undefined, createContext({}))).toBeNull();
  });

  it('RefreshToken returns cookie value', () => {
    const factory = getParamDecoratorFactory(RefreshToken as ParamDecorator);
    expect(factory(undefined, createContext({ cookies: { refreshToken: 'rt' } }))).toBe('rt');
  });

  it('UserAgent returns header or unknown', () => {
    const factory = getParamDecoratorFactory(UserAgent as ParamDecorator);
    expect(
      factory(
        undefined,
        createContext({
          get: (name: string) => (name === 'User-Agent' ? 'Chrome' : undefined),
        }),
      ),
    ).toBe('Chrome');
    expect(
      factory(
        undefined,
        createContext({
          get: () => undefined,
        }),
      ),
    ).toBe('unknown');
  });
});
