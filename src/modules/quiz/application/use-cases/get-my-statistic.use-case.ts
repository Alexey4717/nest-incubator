import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { UserStatisticViewModel } from '../../models/pair-game.model';

@Injectable()
export class GetMyStatisticUseCase implements IUseCase<string, UserStatisticViewModel> {
  constructor(
    private readonly pairGameQueryRepository: PairGameQueryRepository,
    private readonly pairGameRepository: PairGameRepository,
  ) {}

  async execute(userId: string): Promise<UserStatisticViewModel> {
    await this.pairGameRepository.finalizeExpiredActivePairForUser(userId);
    return this.pairGameQueryRepository.getMyStatistic(userId);
  }
}
