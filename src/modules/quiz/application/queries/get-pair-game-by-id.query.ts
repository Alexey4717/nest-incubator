import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { PairGameViewModel } from '../../models/pair-game.model';
import { GetPairGameByIdUseCase } from '../use-cases/get-pair-game-by-id.use-case';

export class GetPairGameByIdQuery extends TypedQuery<PairGameViewModel> {
  constructor(
    public readonly pairId: string,
    public readonly userId: string,
  ) {
    super();
  }
}

@QueryHandler(GetPairGameByIdQuery)
export class GetPairGameByIdHandler implements IQueryHandler<
  GetPairGameByIdQuery,
  PairGameViewModel
> {
  constructor(private readonly getPairGameByIdUseCase: GetPairGameByIdUseCase) {}

  execute(query: GetPairGameByIdQuery): Promise<PairGameViewModel> {
    return this.getPairGameByIdUseCase.execute({ pairId: query.pairId, userId: query.userId });
  }
}
