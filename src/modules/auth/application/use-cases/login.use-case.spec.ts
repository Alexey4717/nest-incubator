import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';

import { CreateSessionUseCase } from '@/modules/session/application/use-cases/create-session.use-case';

import { JwtTokenService } from '../services/jwt-token.service';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let jwtTokenService: { signAccessAndRefreshToken: jest.Mock };
  let createSessionUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    jwtTokenService = { signAccessAndRefreshToken: jest.fn() };
    createSessionUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: JwtTokenService, useValue: jwtTokenService },
        { provide: CreateSessionUseCase, useValue: createSessionUseCase },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);
  });

  it('returns tokens and creates session on success', async () => {
    jwtTokenService.signAccessAndRefreshToken.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      jti: 'jti-1',
      lastActiveDate: '2024-01-01T00:00:00.000Z',
    });
    createSessionUseCase.execute.mockResolvedValue(Result.ok({}));

    const result = await useCase.execute({
      userId: 'user-1',
      ip: '127.0.0.1',
      userAgent: 'Chrome',
    });

    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(createSessionUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        ip: '127.0.0.1',
        title: 'Chrome',
        currentRefreshTokenJti: 'jti-1',
        lastActiveDate: '2024-01-01T00:00:00.000Z',
        deviceId: expect.any(String),
      }),
    );
  });

  it('throws DomainException when session creation fails', async () => {
    jwtTokenService.signAccessAndRefreshToken.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      jti: 'jti-1',
      lastActiveDate: '2024-01-01T00:00:00.000Z',
    });
    createSessionUseCase.execute.mockResolvedValue(
      Result.fail(DomainExceptionCode.InternalServerError),
    );

    await expect(
      useCase.execute({ userId: 'user-1', ip: '127.0.0.1', userAgent: 'Chrome' }),
    ).rejects.toBeInstanceOf(DomainException);
  });
});
