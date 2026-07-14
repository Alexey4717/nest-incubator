import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

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
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute({
    userId,
    deviceId,
    lastActiveDate,
    newLastActiveDate,
  }: UpdateSessionAfterRefreshInput): Promise<boolean> {
    return this.sessionRepository.updateSessionAfterRefreshToken(
      userId,
      deviceId,
      lastActiveDate,
      newLastActiveDate,
    );
  }
}
