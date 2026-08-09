import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';

type DeleteSessionInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class DeleteSessionUseCase implements IUseCase<DeleteSessionInput, ResultType<null>> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({ userId, deviceId }: DeleteSessionInput): Promise<ResultType<null>> {
    const session = await this.sessionRepository.findByDeviceId(deviceId);
    if (!session) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    try {
      session.canBeDeletedBy(userId);
    } catch (error) {
      if (error instanceof DomainException) {
        return Result.fail(error.code, error.extensions);
      }
      throw error;
    }

    const deleted = await this.sessionRepository.deleteOneSessionByUserAndDeviceId(
      userId,
      deviceId,
    );
    if (!deleted) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
