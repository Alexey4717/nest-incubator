import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { FindAllDevicesUseCase } from '@/modules/session/application/use-cases/find-all-devices.use-case';
import { SessionViewModel } from '@/modules/session/models/session-view.model';

@Injectable()
export class GetDevicesUseCase implements IUseCase<string, SessionViewModel[]> {
  constructor(private readonly findAllDevicesUseCase: FindAllDevicesUseCase) {}

  execute(userId: string): Promise<SessionViewModel[]> {
    return this.findAllDevicesUseCase.execute(userId);
  }
}
