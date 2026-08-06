import { Injectable } from '@nestjs/common';

import { Paginator } from '@/core/types/common';
import { IUseCase } from '@/core/types/use-case';

import { GetMyPairGamesQueryParamsDto } from '../../dto/pair-game.dto';
import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameViewModel } from '../../models/pair-game.model';

type GetMyPairGamesInput = {
  userId: string;
  query: GetMyPairGamesQueryParamsDto;
};

@Injectable()
export class GetMyPairGamesUseCase implements IUseCase<
  GetMyPairGamesInput,
  Paginator<PairGameViewModel[]>
> {
  constructor(private readonly pairGameQueryRepository: PairGameQueryRepository) {}

  execute({ userId, query }: GetMyPairGamesInput): Promise<Paginator<PairGameViewModel[]>> {
    return this.pairGameQueryRepository.getMyGames(userId, query);
  }
}
