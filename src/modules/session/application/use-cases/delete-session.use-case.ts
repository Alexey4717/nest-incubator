import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionQueryRepository } from '../../infrastructure/session-query.repository.mongodb';
import { SessionRepository } from '../../infrastructure/session.repository.mongodb';

type DeleteSessionInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class DeleteSessionUseCase implements IUseCase<DeleteSessionInput, void> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly sessionQueryRepository: SessionQueryRepository,
  ) {}

  async execute({ userId, deviceId }: DeleteSessionInput): Promise<void> {
    const session = await this.sessionQueryRepository.findOneByDeviceId(deviceId);
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();
    await this.sessionRepository.deleteOneSessionByUserAndDeviceId(userId, deviceId);
  }
}
