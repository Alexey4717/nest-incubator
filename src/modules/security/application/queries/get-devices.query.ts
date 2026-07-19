import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { SessionViewModel } from '@/modules/session/models/session-view.model';

import { GetDevicesUseCase } from '../use-cases/get-devices.use-case';

export class GetDevicesQuery extends TypedQuery<SessionViewModel[]> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesHandler implements IQueryHandler<GetDevicesQuery, SessionViewModel[]> {
  constructor(private readonly getDevicesUseCase: GetDevicesUseCase) {}

  execute(query: GetDevicesQuery): Promise<SessionViewModel[]> {
    return this.getDevicesUseCase.execute(query.userId);
  }
}
