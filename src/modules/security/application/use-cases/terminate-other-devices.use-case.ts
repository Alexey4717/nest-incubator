import { Injectable } from '@nestjs/common';

import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { DeleteOtherSessionsUseCase } from '@/modules/session/application/use-cases/delete-other-sessions.use-case';

type TerminateOtherDevicesInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class TerminateOtherDevicesUseCase implements IUseCase<
  TerminateOtherDevicesInput,
  ResultType<null>
> {
  constructor(private readonly deleteOtherSessionsUseCase: DeleteOtherSessionsUseCase) {}

  execute({ userId, deviceId }: TerminateOtherDevicesInput): Promise<ResultType<null>> {
    return this.deleteOtherSessionsUseCase.execute({ userId, currentDeviceId: deviceId });
  }
}
