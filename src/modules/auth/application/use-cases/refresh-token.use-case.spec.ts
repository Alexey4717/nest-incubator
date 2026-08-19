import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { UpdateSessionAfterRefreshUseCase } from '@/modules/session/application/use-cases/update-session-after-refresh.use-case';
import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository';

import { JwtTokenService } from '../services/jwt-token.service';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let jwtTokenService: {
    verifyRefreshToken: jest.Mock;
    signAccessAndRefreshToken: jest.Mock;
  };
  let sessionQueryRepository: { findOneByDeviceAndUserId: jest.Mock };
  let updateSessionAfterRefreshUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    jwtTokenService = {
      verifyRefreshToken: jest.fn(),
      signAccessAndRefreshToken: jest.fn(),
    };
    sessionQueryRepository = { findOneByDeviceAndUserId: jest.fn() };
    updateSessionAfterRefreshUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: JwtTokenService, useValue: jwtTokenService },
        { provide: SessionQueryRepository, useValue: sessionQueryRepository },
        {
          provide: UpdateSessionAfterRefreshUseCase,
          useValue: updateSessionAfterRefreshUseCase,
        },
      ],
    }).compile();

    useCase = module.get(RefreshTokenUseCase);
  });

  it('returns null when refresh token is invalid', async () => {
    jwtTokenService.verifyRefreshToken.mockReturnValue(null);

    await expect(useCase.execute('bad-token')).resolves.toBeNull();
    expect(sessionQueryRepository.findOneByDeviceAndUserId).not.toHaveBeenCalled();
  });

  it('returns null when session is not found', async () => {
    jwtTokenService.verifyRefreshToken.mockReturnValue({
      userId: 'user-1',
      deviceId: 'device-1',
      jti: 'jti-1',
    });
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue(null);

    await expect(useCase.execute('token')).resolves.toBeNull();
  });

  it('returns null when session jti does not match', async () => {
    jwtTokenService.verifyRefreshToken.mockReturnValue({
      userId: 'user-1',
      deviceId: 'device-1',
      jti: 'jti-1',
    });
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue({
      currentRefreshTokenJti: 'other-jti',
    });

    await expect(useCase.execute('token')).resolves.toBeNull();
    expect(jwtTokenService.signAccessAndRefreshToken).not.toHaveBeenCalled();
  });

  it('returns null when session update fails', async () => {
    jwtTokenService.verifyRefreshToken.mockReturnValue({
      userId: 'user-1',
      deviceId: 'device-1',
      jti: 'jti-1',
    });
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue({
      currentRefreshTokenJti: 'jti-1',
    });
    jwtTokenService.signAccessAndRefreshToken.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      jti: 'jti-2',
      lastActiveDate: '2024-01-01T00:00:00.000Z',
    });
    updateSessionAfterRefreshUseCase.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.Unauthorized),
    );

    await expect(useCase.execute('token')).resolves.toBeNull();
  });

  it('returns new tokens when refresh succeeds', async () => {
    jwtTokenService.verifyRefreshToken.mockReturnValue({
      userId: 'user-1',
      deviceId: 'device-1',
      jti: 'jti-1',
    });
    sessionQueryRepository.findOneByDeviceAndUserId.mockResolvedValue({
      currentRefreshTokenJti: 'jti-1',
    });
    jwtTokenService.signAccessAndRefreshToken.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      jti: 'jti-2',
      lastActiveDate: '2024-01-01T00:00:00.000Z',
    });
    updateSessionAfterRefreshUseCase.execute.mockResolvedValue(Notification.ok(null));

    await expect(useCase.execute('token')).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(updateSessionAfterRefreshUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      deviceId: 'device-1',
      expectedJti: 'jti-1',
      newJti: 'jti-2',
      lastActiveDate: '2024-01-01T00:00:00.000Z',
    });
  });
});
