import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { PairGameStatus } from '../../domain/pair-game-status.enum';
import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { PairGameViewModel } from '../../models/pair-game.model';
import { GetPairGameByIdUseCase } from './get-pair-game-by-id.use-case';

describe('GetPairGameByIdUseCase', () => {
  let useCase: GetPairGameByIdUseCase;
  let pairGameRepository: { finalizeExpiredActivePairByPublicId: jest.Mock };
  let pairGameQueryRepository: {
    getPairGameView: jest.Mock;
    isUserParticipant: jest.Mock;
  };

  const view: PairGameViewModel = {
    id: 'pair-1',
    status: PairGameStatus.Active,
    firstPlayerProgress: {
      player: { id: 'u1', login: 'alice' },
      answers: [],
      score: 0,
    },
    secondPlayerProgress: null,
    questions: null,
    pairCreatedDate: '2024-01-01T00:00:00.000Z',
    startGameDate: null,
    finishGameDate: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPairGameByIdUseCase,
        {
          provide: PairGameRepository,
          useValue: { finalizeExpiredActivePairByPublicId: jest.fn() },
        },
        {
          provide: PairGameQueryRepository,
          useValue: {
            getPairGameView: jest.fn(),
            isUserParticipant: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(GetPairGameByIdUseCase);
    pairGameRepository = module.get(PairGameRepository);
    pairGameQueryRepository = module.get(PairGameQueryRepository);
  });

  it('throws NotFound when pair game does not exist', async () => {
    pairGameQueryRepository.getPairGameView.mockResolvedValue(null);

    await expect(useCase.execute({ pairId: 'missing', userId: 'u1' })).rejects.toThrow(
      DomainException,
    );
    await expect(useCase.execute({ pairId: 'missing', userId: 'u1' })).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
    expect(pairGameRepository.finalizeExpiredActivePairByPublicId).toHaveBeenCalledWith('missing');
  });

  it('throws Forbidden when user is not a participant', async () => {
    pairGameQueryRepository.getPairGameView.mockResolvedValue(view);
    pairGameQueryRepository.isUserParticipant.mockResolvedValue(false);

    await expect(useCase.execute({ pairId: 'pair-1', userId: 'outsider' })).rejects.toMatchObject({
      code: DomainExceptionCode.Forbidden,
    });
  });

  it('returns pair game view for participant', async () => {
    pairGameQueryRepository.getPairGameView.mockResolvedValue(view);
    pairGameQueryRepository.isUserParticipant.mockResolvedValue(true);

    await expect(useCase.execute({ pairId: 'pair-1', userId: 'u1' })).resolves.toEqual(view);
  });
});
