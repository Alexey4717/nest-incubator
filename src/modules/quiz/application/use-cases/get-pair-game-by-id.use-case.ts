import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { throwIfNotFound } from '@/core/errors/throw-if-not-found';
import { IUseCase } from '@/core/types/use-case';

import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { PairGameViewModel } from '../../models/pair-game.model';

type GetPairGameByIdInput = {
  pairId: string;
  userId: string;
};

@Injectable()
export class GetPairGameByIdUseCase implements IUseCase<GetPairGameByIdInput, PairGameViewModel> {
  constructor(
    private readonly pairGameQueryRepository: PairGameQueryRepository,
    private readonly pairGameRepository: PairGameRepository,
  ) {}

  async execute({ pairId, userId }: GetPairGameByIdInput): Promise<PairGameViewModel> {
    await this.pairGameRepository.finalizeExpiredActivePairByPublicId(pairId);

    const view = await this.pairGameQueryRepository.getPairGameView(pairId);
    throwIfNotFound(view);

    const isParticipant = await this.pairGameQueryRepository.isUserParticipant(pairId, userId);
    if (!isParticipant) {
      throw new DomainException(DomainExceptionCode.Forbidden);
    }

    return view!;
  }
}
