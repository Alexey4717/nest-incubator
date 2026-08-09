import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';
import { SessionQueryRepository } from '@/modules/session/infrastructure/session-query.repository';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';

type LogoutInput = {
  userId: string;
  refreshTokenJWTPayload: IRefreshTokenJwtPayload;
};

@Injectable()
export class LogoutUseCase implements IUseCase<LogoutInput, ResultType<null>> {
  constructor(
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
  ) {}

  async execute({ userId, refreshTokenJWTPayload }: LogoutInput): Promise<ResultType<null>> {
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserId(
      refreshTokenJWTPayload.deviceId,
      userId,
    );
    if (!found || found.currentRefreshTokenJti !== refreshTokenJWTPayload.jti) {
      return Result.fail(DomainExceptionCode.Unauthorized);
    }

    return this.deleteSessionUseCase.execute({
      userId,
      deviceId: refreshTokenJWTPayload.deviceId,
    });
  }
}
