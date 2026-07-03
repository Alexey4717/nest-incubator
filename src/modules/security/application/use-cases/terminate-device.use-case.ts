import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';

type TerminateDeviceInput = {
  userId: string;
  deviceId: string;
};

@Injectable()
export class TerminateDeviceUseCase implements IUseCase<TerminateDeviceInput, void> {
  constructor(private readonly deleteSessionUseCase: DeleteSessionUseCase) {}

  async execute({ userId, deviceId }: TerminateDeviceInput): Promise<void> {
    await this.deleteSessionUseCase.execute({ userId, deviceId });
  }
}
