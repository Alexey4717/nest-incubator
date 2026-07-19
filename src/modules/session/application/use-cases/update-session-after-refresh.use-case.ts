import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionQueryRepository } from '../../infrastructure/session-query.repository';
import { modelToDb } from '../../infrastructure/session.mapper';
import { SessionRepository } from '../../infrastructure/session.repository';

type UpdateSessionAfterRefreshInput = {
  userId: string;
  deviceId: string;
  lastActiveDate: string;
  newLastActiveDate: string;
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
    lastActiveDate,
    newLastActiveDate,
  }: UpdateSessionAfterRefreshInput): Promise<boolean> {
    const found = await this.sessionQueryRepository.findOneByDeviceAndUserId(deviceId, userId);
    if (!found) return false;

    const session = SessionEntity.reconstitute(modelToDb(found));

    try {
      session.updateLastActiveDate(lastActiveDate, newLastActiveDate);
    } catch {
      return false;
    }

    return this.sessionRepository.save(session);
  }
}
