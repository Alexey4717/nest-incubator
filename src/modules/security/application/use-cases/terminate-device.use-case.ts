import { Injectable } from '@nestjs/common';

import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';

type TerminateDeviceInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class TerminateDeviceUseCase implements IUseCase<TerminateDeviceInput, ResultType<null>> {
  constructor(private readonly deleteSessionUseCase: DeleteSessionUseCase) {}

  execute({ userId, deviceId }: TerminateDeviceInput): Promise<ResultType<null>> {
    return this.deleteSessionUseCase.execute({ userId, deviceId });
  }
}
