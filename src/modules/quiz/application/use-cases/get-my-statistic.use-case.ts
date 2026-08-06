import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { UserStatisticViewModel } from '../../models/pair-game.model';

@Injectable()
export class GetMyStatisticUseCase implements IUseCase<string, UserStatisticViewModel> {
  constructor(private readonly pairGameQueryRepository: PairGameQueryRepository) {}

  execute(userId: string): Promise<UserStatisticViewModel> {
    return this.pairGameQueryRepository.getMyStatistic(userId);
  }
}
