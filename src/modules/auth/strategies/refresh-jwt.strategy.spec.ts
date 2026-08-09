import { AuthConfig } from '../auth.config';
import { RefreshJwtStrategy } from './refresh-jwt.strategy';

describe('RefreshJwtStrategy', () => {
  const strategy = new RefreshJwtStrategy({
    REFRESH_TOKEN_SECRET: 'refresh-secret',
  } as AuthConfig);

  it('returns userId and full payload', () => {
    const payload = {
      userId: 'u1',
      deviceId: 'd1',
      jti: 'jti-1',
      iat: 1,
    };

    expect(strategy.validate(payload)).toEqual({
      userId: 'u1',
      payload,
    });
  });
});
