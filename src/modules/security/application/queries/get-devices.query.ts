import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { SecurityDeviceViewModel } from '../../types/view-models';
import { GetDevicesUseCase } from '../use-cases/get-devices.use-case';

export class GetDevicesQuery extends TypedQuery<SecurityDeviceViewModel[]> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesHandler implements IQueryHandler<
  GetDevicesQuery,
  SecurityDeviceViewModel[]
> {
  constructor(private readonly getDevicesUseCase: GetDevicesUseCase) {}

  execute(query: GetDevicesQuery): Promise<SecurityDeviceViewModel[]> {
    return this.getDevicesUseCase.execute(query.userId);
  }
}
