import { Injectable } from '@nestjs/common';

import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';

type DeleteOtherSessionsInput = {
  userId: string;
  currentDeviceId: string;
};

@Injectable()
export class DeleteOtherSessionsUseCase implements IUseCase<
  DeleteOtherSessionsInput,
  Notification<null>
> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({
    userId,
    currentDeviceId,
  }: DeleteOtherSessionsInput): Promise<Notification<null>> {
    await this.sessionRepository.deleteAllSessionExceptCurrent(userId, currentDeviceId);
    return Notification.ok(null);
  }
}
