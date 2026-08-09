import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { AuthConfig } from '../auth.config';
import { BasicStrategy } from './basic.strategy';

describe('BasicStrategy', () => {
  const authConfig = {
    SA_LOGIN: 'admin',
    SA_PASSWORD: 'qwerty',
  } as AuthConfig;

  const strategy = new BasicStrategy(authConfig);

  it('returns true for valid SA credentials', () => {
    expect(strategy.validate({} as never, 'admin', 'qwerty')).toBe(true);
  });

  it('throws Unauthorized for invalid credentials', () => {
    expect(() => strategy.validate({} as never, 'admin', 'wrong')).toThrow(DomainException);
    expect(() => strategy.validate({} as never, 'user', 'qwerty')).toThrow(
      expect.objectContaining({ code: DomainExceptionCode.Unauthorized }),
    );
  });
});
