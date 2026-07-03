import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { DeleteOtherSessionsUseCase } from '@/modules/session/application/use-cases/delete-other-sessions.use-case';

type TerminateOtherDevicesInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class TerminateOtherDevicesUseCase implements IUseCase<TerminateOtherDevicesInput, void> {
  constructor(private readonly deleteOtherSessionsUseCase: DeleteOtherSessionsUseCase) {}

  async execute({ userId, deviceId }: TerminateOtherDevicesInput): Promise<void> {
    await this.deleteOtherSessionsUseCase.execute({ userId, currentDeviceId: deviceId });
  }
}
