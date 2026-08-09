import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { PairGameStatus } from '../../domain/pair-game-status.enum';
import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { PairGameViewModel } from '../../models/pair-game.model';
import { GetMyCurrentPairGameUseCase } from './get-my-current-pair-game.use-case';

describe('GetMyCurrentPairGameUseCase', () => {
  let useCase: GetMyCurrentPairGameUseCase;
  let pairGameRepository: { finalizeExpiredActivePairForUser: jest.Mock };
  let pairGameQueryRepository: {
    findCurrentPairPublicIdForUser: jest.Mock;
    getPairGameView: jest.Mock;
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
        GetMyCurrentPairGameUseCase,
        {
          provide: PairGameRepository,
          useValue: { finalizeExpiredActivePairForUser: jest.fn() },
        },
        {
          provide: PairGameQueryRepository,
          useValue: {
            findCurrentPairPublicIdForUser: jest.fn(),
            getPairGameView: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(GetMyCurrentPairGameUseCase);
    pairGameRepository = module.get(PairGameRepository);
    pairGameQueryRepository = module.get(PairGameQueryRepository);
  });

  it('throws NotFound when user has no current pair', async () => {
    pairGameQueryRepository.findCurrentPairPublicIdForUser.mockResolvedValue(null);

    await expect(useCase.execute('u1')).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
    expect(pairGameRepository.finalizeExpiredActivePairForUser).toHaveBeenCalledWith('u1');
  });

  it('throws NotFound when pair view is missing', async () => {
    pairGameQueryRepository.findCurrentPairPublicIdForUser.mockResolvedValue('pair-1');
    pairGameQueryRepository.getPairGameView.mockResolvedValue(null);

    await expect(useCase.execute('u1')).rejects.toThrow(DomainException);
  });

  it('returns current pair game view', async () => {
    pairGameQueryRepository.findCurrentPairPublicIdForUser.mockResolvedValue('pair-1');
    pairGameQueryRepository.getPairGameView.mockResolvedValue(view);

    await expect(useCase.execute('u1')).resolves.toEqual(view);
  });
});
