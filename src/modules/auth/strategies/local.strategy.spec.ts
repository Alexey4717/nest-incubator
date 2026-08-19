import { QueryBus } from '@nestjs/cqrs';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { CheckCredentialsQuery } from '@/modules/user/application/queries/check-credentials.query';

import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const queryBus = {
    execute: jest.fn(),
  };

  const strategy = new LocalStrategy(queryBus as unknown as QueryBus);

  beforeEach(() => {
    queryBus.execute.mockReset();
  });

  it('returns authenticated user when credentials are valid', async () => {
    queryBus.execute.mockResolvedValue({ id: 'user-1' });

    await expect(strategy.validate('login', 'password')).resolves.toEqual({ userId: 'user-1' });
    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(CheckCredentialsQuery));
    expect(queryBus.execute.mock.calls[0][0].input).toEqual({
      loginOrEmail: 'login',
      password: 'password',
    });
  });

  it('throws Unauthorized when credentials are invalid', async () => {
    queryBus.execute.mockResolvedValue(null);

    await expect(strategy.validate('login', 'bad')).rejects.toThrow(DomainException);
    await expect(strategy.validate('login', 'bad')).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });
  });
});
