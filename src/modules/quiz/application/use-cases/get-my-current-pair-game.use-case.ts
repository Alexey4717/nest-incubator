import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';
import { throwIfNotFound } from '@/core/utils/throw-if-not-found';

import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameViewModel } from '../../models/pair-game.model';

@Injectable()
export class GetMyCurrentPairGameUseCase implements IUseCase<string, PairGameViewModel> {
  constructor(private readonly pairGameQueryRepository: PairGameQueryRepository) {}

  async execute(userId: string): Promise<PairGameViewModel> {
    const pairPublicId = await this.pairGameQueryRepository.findCurrentPairPublicIdForUser(userId);
    throwIfNotFound(pairPublicId);

    const view = await this.pairGameQueryRepository.getPairGameView(pairPublicId!);
    throwIfNotFound(view);

    return view!;
  }
}
