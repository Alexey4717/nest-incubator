import { AuthConfig } from '../auth.config';
import { AccessJwtStrategy } from './access-jwt.strategy';

describe('AccessJwtStrategy', () => {
  const strategy = new AccessJwtStrategy({
    ACCESS_TOKEN_SECRET: 'access-secret',
  } as AuthConfig);

  it('maps jwt payload to authenticated user', () => {
    expect(strategy.validate({ userId: 'u1', deviceId: 'd1' })).toEqual({
      userId: 'u1',
      deviceId: 'd1',
    });
  });
});
