import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { UpdateSessionAfterRefreshUseCase } from '@/modules/session/application/use-cases/update-session-after-refresh.use-case';
import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository.mongodb';
import { FindUserByIdUseCase } from '@/modules/user/application/use-cases/find-user-by-id.use-case';

import { AuthTokensViewModel } from '../../types/view-models';
import { JwtTokenService } from '../services/jwt-token.service';

@Injectable()
export class RefreshTokenUseCase implements IUseCase<string, AuthTokensViewModel | null> {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly updateSessionAfterRefreshUseCase: UpdateSessionAfterRefreshUseCase,
  ) {}

  async execute(token: string): Promise<AuthTokensViewModel | null> {
    const jwtPayload = this.jwtTokenService.verifyRefreshToken(token);
    if (!jwtPayload) return null;

    const userId = jwtPayload.userId;
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = jwtPayload.lastActiveDate;
    const user = await this.findUserByIdUseCase.execute(userId);
    if (!user) return null;

    const device = await this.sessionQueryRepository.findOneByDeviceAndUserIdAndDate(
      deviceId,
      userId,
      lastActiveDate,
    );
    if (!device) return null;

    const {
      accessToken,
      refreshToken,
      lastActiveDate: newLastActiveDate,
    } = this.jwtTokenService.signAccessAndRefreshToken(userId, deviceId);
    await this.updateSessionAfterRefreshUseCase.execute({
      userId,
      deviceId,
      newLastActiveDate,
    });
    return { accessToken, refreshToken };
  }
}
