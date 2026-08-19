import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';
import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

type LogoutInput = {
  userId: string;
  refreshTokenJWTPayload: IRefreshTokenJwtPayload;
};

@Injectable()
export class LogoutUseCase implements IUseCase<LogoutInput, Notification<null>> {
  constructor(
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
  ) {}

  async execute({ userId, refreshTokenJWTPayload }: LogoutInput): Promise<Notification<null>> {
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserId(
      refreshTokenJWTPayload.deviceId,
      userId,
    );
    if (!found || found.currentRefreshTokenJti !== refreshTokenJWTPayload.jti) {
      return Notification.fail(DomainExceptionCode.Unauthorized);
    }

    return this.deleteSessionUseCase.execute({
      userId,
      deviceId: refreshTokenJWTPayload.deviceId,
    });
  }
}
