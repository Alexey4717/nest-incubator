import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/core/types/common';
import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { GetMyPairGamesQueryParamsDto } from '../../dto/pair-game.dto';
import { PairGameViewModel } from '../../models/pair-game.model';
import { GetMyPairGamesUseCase } from '../use-cases/get-my-pair-games.use-case';

export class GetMyPairGamesQuery extends TypedQuery<Paginator<PairGameViewModel[]>> {
  constructor(
    public readonly userId: string,
    public readonly query: GetMyPairGamesQueryParamsDto,
  ) {
    super();
  }
}

@QueryHandler(GetMyPairGamesQuery)
export class GetMyPairGamesHandler implements IQueryHandler<
  GetMyPairGamesQuery,
  Paginator<PairGameViewModel[]>
> {
  constructor(private readonly getMyPairGamesUseCase: GetMyPairGamesUseCase) {}

  execute(query: GetMyPairGamesQuery): Promise<Paginator<PairGameViewModel[]>> {
    return this.getMyPairGamesUseCase.execute({ userId: query.userId, query: query.query });
  }
}
