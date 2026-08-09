import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { ResultStatus } from '@/core/result/result.types';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';
import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository';

import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let sessionQueryRepository: { findOneByDeviceAndUserId: jest.Mock };
  let deleteSessionUseCase: { execute: jest.Mock };

  const payload = {
    userId: 'user-1',
    deviceId: 'device-1',
    jti: 'jti-1',
    iat: 1,
  };

  beforeEach(async () => {
    sessionQueryRepository = { findOneByDeviceAndUserId: jest.fn() };
    deleteSessionUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: SessionQueryRepository, useValue: sessionQueryRepository },
        { provide: DeleteSessionUseCase, useValue: deleteSessionUseCase },
      ],
    }).compile();

    useCase = module.get(LogoutUseCase);
  });

  it('returns Unauthorized when session is not found', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue(null);

    const result = await useCase.execute({
      userId: 'user-1',
      refreshTokenJWTPayload: payload,
    });

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.Unauthorized,
      extensions: [],
    });
    expect(deleteSessionUseCase.execute).not.toHaveBeenCalled();
  });

  it('returns Unauthorized when refresh token jti does not match', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue({
      currentRefreshTokenJti: 'other-jti',
    });

    const result = await useCase.execute({
      userId: 'user-1',
      refreshTokenJWTPayload: payload,
    });

    expect(result.status).toBe(ResultStatus.Failure);
    expect(result).toMatchObject({ code: DomainExceptionCode.Unauthorized });
    expect(deleteSessionUseCase.execute).not.toHaveBeenCalled();
  });

  it('deletes session when refresh token is valid', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue({
      currentRefreshTokenJti: 'jti-1',
    });
    deleteSessionUseCase.execute.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute({
      userId: 'user-1',
      refreshTokenJWTPayload: payload,
    });

    expect(result).toEqual(Result.ok(null));
    expect(deleteSessionUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      deviceId: 'device-1',
    });
  });
});
