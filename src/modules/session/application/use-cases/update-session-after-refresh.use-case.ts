import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionQueryRepository } from '../../infrastructure/session-query.repository';
import { modelToDb } from '../../infrastructure/session.mapper';
import { SessionRepository } from '../../infrastructure/session.repository';

type UpdateSessionAfterRefreshInput = {
  userId: string;
  deviceId: string;
  expectedJti: string;
  newJti: string;
  lastActiveDate: string;
};

@Injectable()
export class UpdateSessionAfterRefreshUseCase implements IUseCase<
  UpdateSessionAfterRefreshInput,
  Notification<null>
> {
  constructor(
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute({
    userId,
    deviceId,
    expectedJti,
    newJti,
    lastActiveDate,
  }: UpdateSessionAfterRefreshInput): Promise<Notification<null>> {
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserId(deviceId, userId);
    if (!found) {
      return Notification.fail(DomainExceptionCode.Unauthorized);
    }

    const session = SessionEntity.reconstitute(modelToDb(found));

    try {
      session.rotateRefreshToken(expectedJti, newJti, lastActiveDate);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      return Notification.fail(DomainExceptionCode.Unauthorized);
    }

    const updated = await this.sessionRepository.rotateRefreshToken(
      userId,
      deviceId,
      expectedJti,
      session,
    );
    if (!updated) {
      return Notification.fail(DomainExceptionCode.Unauthorized);
    }

    return Notification.ok(null);
  }
}
