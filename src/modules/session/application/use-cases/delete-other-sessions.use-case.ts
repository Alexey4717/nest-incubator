import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository.mongodb';

type DeleteOtherSessionsInput = {
  userId: string;
  currentDeviceId: string;
};

@Injectable()
export class DeleteOtherSessionsUseCase implements IUseCase<DeleteOtherSessionsInput, void> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({ userId, currentDeviceId }: DeleteOtherSessionsInput): Promise<void> {
    await this.sessionRepository.deleteAllSessionExceptCurrent(userId, currentDeviceId);
  }
}
