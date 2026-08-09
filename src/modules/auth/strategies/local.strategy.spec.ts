import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { CheckCredentialsUseCase } from '@/modules/user/application/use-cases/check-credentials.use-case';

import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const checkCredentialsUseCase = {
    execute: jest.fn(),
  };

  const strategy = new LocalStrategy(checkCredentialsUseCase as unknown as CheckCredentialsUseCase);

  beforeEach(() => {
    checkCredentialsUseCase.execute.mockReset();
  });

  it('returns authenticated user when credentials are valid', async () => {
    checkCredentialsUseCase.execute.mockResolvedValue({ id: 'user-1' });

    await expect(strategy.validate('login', 'password')).resolves.toEqual({ userId: 'user-1' });
    expect(checkCredentialsUseCase.execute).toHaveBeenCalledWith({
      loginOrEmail: 'login',
      password: 'password',
    });
  });

  it('throws Unauthorized when credentials are invalid', async () => {
    checkCredentialsUseCase.execute.mockResolvedValue(null);

    await expect(strategy.validate('login', 'bad')).rejects.toThrow(DomainException);
    await expect(strategy.validate('login', 'bad')).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });
  });
});
