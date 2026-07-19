import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { FindAllDevicesUseCase } from '@/modules/session/application/use-cases/find-all-devices.use-case';

import { toSecurityDeviceViewModels } from '../../security.view-mapper';
import { SecurityDeviceViewModel } from '../../types/view-models';

@Injectable()
export class GetDevicesUseCase implements IUseCase<string, SecurityDeviceViewModel[]> {
  constructor(private readonly findAllDevicesUseCase: FindAllDevicesUseCase) {}

  async execute(userId: string): Promise<SecurityDeviceViewModel[]> {
    const devices = await this.findAllDevicesUseCase.execute(userId);
    return toSecurityDeviceViewModels(devices);
  }
}
