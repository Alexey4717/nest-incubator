import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';
import { throwIfNotFound } from '@/core/utils/throw-if-not-found';

import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { PairGameViewModel } from '../../models/pair-game.model';

@Injectable()
export class GetMyCurrentPairGameUseCase implements IUseCase<string, PairGameViewModel> {
  constructor(
    private readonly pairGameQueryRepository: PairGameQueryRepository,
    private readonly pairGameRepository: PairGameRepository,
  ) {}

  async execute(userId: string): Promise<PairGameViewModel> {
    await this.pairGameRepository.finalizeExpiredActivePairForUser(userId);

    const pairPublicId = await this.pairGameQueryRepository.findCurrentPairPublicIdForUser(userId);
    throwIfNotFound(pairPublicId);

    const view = await this.pairGameQueryRepository.getPairGameView(pairPublicId!);
    throwIfNotFound(view);

    return view!;
  }
}
