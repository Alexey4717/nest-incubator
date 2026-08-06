import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { UserStatisticViewModel } from '../../models/pair-game.model';
import { GetMyStatisticUseCase } from '../use-cases/get-my-statistic.use-case';

export class GetMyStatisticQuery extends TypedQuery<UserStatisticViewModel> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticHandler implements IQueryHandler<
  GetMyStatisticQuery,
  UserStatisticViewModel
> {
  constructor(private readonly getMyStatisticUseCase: GetMyStatisticUseCase) {}

  execute(query: GetMyStatisticQuery): Promise<UserStatisticViewModel> {
    return this.getMyStatisticUseCase.execute(query.userId);
  }
}
