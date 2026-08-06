import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/core/types/common';
import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { GetTopUsersQueryParamsDto } from '../../dto/pair-game.dto';
import { TopUserStatisticViewModel } from '../../models/pair-game.model';
import { GetTopUsersUseCase } from '../use-cases/get-top-users.use-case';

export class GetTopUsersQuery extends TypedQuery<Paginator<TopUserStatisticViewModel[]>> {
  constructor(public readonly query: GetTopUsersQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetTopUsersQuery)
export class GetTopUsersHandler implements IQueryHandler<
  GetTopUsersQuery,
  Paginator<TopUserStatisticViewModel[]>
> {
  constructor(private readonly getTopUsersUseCase: GetTopUsersUseCase) {}

  execute(query: GetTopUsersQuery): Promise<Paginator<TopUserStatisticViewModel[]>> {
    return this.getTopUsersUseCase.execute(query.query);
  }
}
