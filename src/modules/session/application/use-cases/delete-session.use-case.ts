import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';

type DeleteSessionInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class DeleteSessionUseCase implements IUseCase<DeleteSessionInput, Notification<null>> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({ userId, deviceId }: DeleteSessionInput): Promise<Notification<null>> {
    const session = await this.sessionRepository.findByDeviceId(deviceId);
    if (!session) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    try {
      session.canBeDeletedBy(userId);
    } catch (error) {
      if (error instanceof DomainException) {
        return Notification.fail(error.code, error.extensions);
      }
      throw error;
    }

    const deleted = await this.sessionRepository.deleteOneSessionByUserAndDeviceId(
      userId,
      deviceId,
    );
    if (!deleted) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    return Notification.ok(null);
  }
}
