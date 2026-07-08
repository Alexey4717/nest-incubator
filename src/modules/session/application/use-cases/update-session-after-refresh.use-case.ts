import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';

type UpdateSessionAfterRefreshInput = {
  userId: string;
  deviceId: string;
  newLastActiveDate: string;
};

@Injectable()
export class UpdateSessionAfterRefreshUseCase implements IUseCase<
  UpdateSessionAfterRefreshInput,
  void
> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({
    userId,
    deviceId,
    newLastActiveDate,
  }: UpdateSessionAfterRefreshInput): Promise<void> {
    await this.sessionRepository.updateSessionAfterRefreshToken(
      userId,
      deviceId,
      newLastActiveDate,
    );
  }
}
