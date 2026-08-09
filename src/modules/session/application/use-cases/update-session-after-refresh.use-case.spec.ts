import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { ResultStatus } from '@/core/result/result.types';

import { SessionQueryRepository } from '../../infrastructure/session-query.repository';
import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionModel } from '../../models/session.model';
import { UpdateSessionAfterRefreshUseCase } from './update-session-after-refresh.use-case';

function makeSession(overrides: Partial<SessionModel> = {}): SessionModel {
  return {
    userId: 'user-1',
    deviceId: 'device-1',
    ip: '127.0.0.1',
    title: 'Chrome',
    lastActiveDate: '2024-01-01T00:00:00.000Z',
    currentRefreshTokenJti: 'jti-1',
    ...overrides,
  };
}

describe('UpdateSessionAfterRefreshUseCase', () => {
  let useCase: UpdateSessionAfterRefreshUseCase;
  let sessionQueryRepository: { findOneByDeviceAndUserId: jest.Mock };
  let sessionRepository: { rotateRefreshToken: jest.Mock };

  const input = {
    userId: 'user-1',
    deviceId: 'device-1',
    expectedJti: 'jti-1',
    newJti: 'jti-2',
    lastActiveDate: '2024-01-02T00:00:00.000Z',
  };

  beforeEach(async () => {
    sessionQueryRepository = { findOneByDeviceAndUserId: jest.fn() };
    sessionRepository = { rotateRefreshToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSessionAfterRefreshUseCase,
        { provide: SessionQueryRepository, useValue: sessionQueryRepository },
        { provide: SessionRepository, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get(UpdateSessionAfterRefreshUseCase);
  });

  it('returns Unauthorized when session is not found', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue(null);

    const result = await useCase.execute(input);

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.Unauthorized,
      extensions: [],
    });
    expect(sessionRepository.rotateRefreshToken).not.toHaveBeenCalled();
  });

  it('returns NotFound when expected jti does not match', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue(
      makeSession({ currentRefreshTokenJti: 'other-jti' }),
    );

    const result = await useCase.execute(input);

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.NotFound,
      extensions: [],
    });
    expect(sessionRepository.rotateRefreshToken).not.toHaveBeenCalled();
  });

  it('returns Unauthorized when repository rotate fails', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue(makeSession());
    sessionRepository.rotateRefreshToken.mockResolvedValue(false);

    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.Unauthorized,
    });
  });

  it('rotates refresh token and returns ok', async () => {
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue(makeSession());
    sessionRepository.rotateRefreshToken.mockResolvedValue(true);

    const result = await useCase.execute(input);

    expect(result).toEqual({ status: ResultStatus.Success, data: null });
    expect(sessionRepository.rotateRefreshToken).toHaveBeenCalledWith(
      'user-1',
      'device-1',
      'jti-1',
      expect.objectContaining({
        currentRefreshTokenJti: 'jti-2',
      }),
    );
  });
});
