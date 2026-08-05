import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { PairGameViewModel } from '../../models/pair-game.model';
import { GetMyCurrentPairGameUseCase } from '../use-cases/get-my-current-pair-game.use-case';

export class GetMyCurrentPairGameQuery extends TypedQuery<PairGameViewModel> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMyCurrentPairGameQuery)
export class GetMyCurrentPairGameHandler implements IQueryHandler<
  GetMyCurrentPairGameQuery,
  PairGameViewModel
> {
  constructor(private readonly getMyCurrentPairGameUseCase: GetMyCurrentPairGameUseCase) {}

  execute(query: GetMyCurrentPairGameQuery): Promise<PairGameViewModel> {
    return this.getMyCurrentPairGameUseCase.execute(query.userId);
  }
}
