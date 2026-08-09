import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthConfig } from '../../auth.config';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let nestJwtService: { sign: jest.Mock; verify: jest.Mock };
  let authConfig: {
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_LIFE_TIME: number;
    REFRESH_TOKEN_LIFE_TIME: number;
  };

  beforeEach(async () => {
    nestJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    authConfig = {
      ACCESS_TOKEN_SECRET: 'access-secret',
      REFRESH_TOKEN_SECRET: 'refresh-secret',
      ACCESS_TOKEN_LIFE_TIME: 60,
      REFRESH_TOKEN_LIFE_TIME: 120,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: NestJwtService, useValue: nestJwtService },
        { provide: AuthConfig, useValue: authConfig },
      ],
    }).compile();

    service = module.get(JwtTokenService);
  });

  describe('signAccessAndRefreshToken', () => {
    it('returns access and refresh tokens with jti and lastActiveDate', () => {
      nestJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = service.signAccessAndRefreshToken('user-1', 'device-1');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.jti).toEqual(expect.any(String));
      expect(result.lastActiveDate).toEqual(expect.any(String));
      expect(nestJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { userId: 'user-1', deviceId: 'device-1' },
        { secret: 'access-secret', expiresIn: 60 },
      );
      expect(nestJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { userId: 'user-1', deviceId: 'device-1', jti: result.jti },
        { secret: 'refresh-secret', expiresIn: 120 },
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('returns payload when token is valid', () => {
      const payload = { userId: 'user-1', deviceId: 'device-1', jti: 'jti-1', iat: 1 };
      nestJwtService.verify.mockReturnValue(payload);

      expect(service.verifyRefreshToken('token')).toEqual(payload);
      expect(nestJwtService.verify).toHaveBeenCalledWith('token', {
        secret: 'refresh-secret',
      });
    });

    it('returns null when verification throws', () => {
      nestJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(service.verifyRefreshToken('bad-token')).toBeNull();
    });
  });
});
