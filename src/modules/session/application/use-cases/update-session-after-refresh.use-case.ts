import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

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
  boolean
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
  }: UpdateSessionAfterRefreshInput): Promise<boolean> {
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserId(deviceId, userId);
    if (!found) return false;

    const session = SessionEntity.reconstitute(modelToDb(found));

    try {
      session.rotateRefreshToken(expectedJti, newJti, lastActiveDate);
    } catch {
      return false;
    }

    return this.sessionRepository.rotateRefreshToken(userId, deviceId, expectedJti, session);
  }
}
