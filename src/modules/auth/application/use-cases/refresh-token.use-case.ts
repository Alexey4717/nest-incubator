import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { UpdateSessionAfterRefreshUseCase } from '@/modules/session/application/use-cases/update-session-after-refresh.use-case';
import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository';

import { AuthTokensViewModel } from '../../types/view-models';
import { JwtTokenService } from '../services/jwt-token.service';

@Injectable()
export class RefreshTokenUseCase implements IUseCase<string, AuthTokensViewModel | null> {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly updateSessionAfterRefreshUseCase: UpdateSessionAfterRefreshUseCase,
  ) {}

  async execute(token: string): Promise<AuthTokensViewModel | null> {
    const jwtPayload = this.jwtTokenService.verifyRefreshToken(token);
    if (!jwtPayload) return null;

    const userId = jwtPayload.userId;
    const deviceId = jwtPayload.deviceId;
    const jti = jwtPayload.jti;

    const device = await this.sessionQueryRepository.findOneByDeviceAndUserId(deviceId, userId);
    if (!device || device.currentRefreshTokenJti !== jti) return null;

    const {
      accessToken,
      refreshToken,
      jti: newJti,
      lastActiveDate,
    } = this.jwtTokenService.signAccessAndRefreshToken(userId, deviceId);

    const updateResult = await this.updateSessionAfterRefreshUseCase.execute({
      userId,
      deviceId,
      expectedJti: jti,
      newJti,
      lastActiveDate,
    });
    if (updateResult.hasError()) return null;

    return { accessToken, refreshToken };
  }
}
