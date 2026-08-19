import { Injectable } from '@nestjs/common';

import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';

type TerminateDeviceInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class TerminateDeviceUseCase implements IUseCase<TerminateDeviceInput, Notification<null>> {
  constructor(private readonly deleteSessionUseCase: DeleteSessionUseCase) {}

  execute({ userId, deviceId }: TerminateDeviceInput): Promise<Notification<null>> {
    return this.deleteSessionUseCase.execute({ userId, deviceId });
  }
}
