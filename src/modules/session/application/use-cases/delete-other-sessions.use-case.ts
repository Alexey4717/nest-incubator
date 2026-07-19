import { Injectable } from '@nestjs/common';

import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';

type DeleteOtherSessionsInput = {
  userId: string;
  currentDeviceId: string;
};

@Injectable()
export class DeleteOtherSessionsUseCase implements IUseCase<
  DeleteOtherSessionsInput,
  ResultType<null>
> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute({ userId, currentDeviceId }: DeleteOtherSessionsInput): Promise<ResultType<null>> {
    await this.sessionRepository.deleteAllSessionExceptCurrent(userId, currentDeviceId);
    return Result.ok(null);
  }
}
