import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { IUseCase } from '@/shared/types/use-case';

import { SessionQueryRepository } from '../../infrastructure/session-query.repository';
import { SessionRepository } from '../../infrastructure/session.repository';

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
    if (!session) {
      throw new DomainException(DomainExceptionCode.NotFound);
    }
    if (session.userId !== userId) {
      throw new DomainException(DomainExceptionCode.Forbidden);
    }
    await this.sessionRepository.deleteOneSessionByUserAndDeviceId(userId, deviceId);
  }
}
