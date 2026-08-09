import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { IUseCase } from '@/core/types/use-case';

import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { PairGameViewModel } from '../../models/pair-game.model';

@Injectable()
export class ConnectPairGameUseCase implements IUseCase<string, PairGameViewModel> {
  constructor(
    private readonly pairGameRepository: PairGameRepository,
    private readonly pairGameQueryRepository: PairGameQueryRepository,
  ) {}

  async execute(userId: string): Promise<PairGameViewModel> {
    const pairPublicId = await this.pairGameRepository.connect(userId);
    const view = await this.pairGameQueryRepository.getPairGameView(pairPublicId);
    if (!view) {
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }
    return view;
  }
}
