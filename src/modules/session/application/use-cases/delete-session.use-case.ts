import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { IUseCase } from '@/core/types/use-case';

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionQueryRepository } from '../../infrastructure/session-query.repository';
import { modelToDb } from '../../infrastructure/session.mapper';
import { SessionRepository } from '../../infrastructure/session.repository';

type DeleteSessionInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class DeleteSessionUseCase implements IUseCase<DeleteSessionInput, void> {
  constructor(
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute({ userId, deviceId }: DeleteSessionInput): Promise<void> {
    const found = await this.sessionQueryRepository.findOneByDeviceId(deviceId);
    if (!found) {
      throw new DomainException(DomainExceptionCode.NotFound);
    }

    const session = SessionEntity.reconstitute(modelToDb(found));
    session.canBeDeletedBy(userId);

    const deleted = await this.sessionRepository.deleteOneSessionByUserAndDeviceId(
      userId,
      deviceId,
    );
    if (!deleted) {
      throw new DomainException(DomainExceptionCode.NotFound);
    }
  }
}
