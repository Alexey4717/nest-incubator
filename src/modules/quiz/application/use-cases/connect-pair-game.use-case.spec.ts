import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { PairGameStatus } from '../../domain/pair-game-status.enum';
import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { PairGameViewModel } from '../../models/pair-game.model';
import { ConnectPairGameUseCase } from './connect-pair-game.use-case';

describe('ConnectPairGameUseCase', () => {
  let useCase: ConnectPairGameUseCase;
  let pairGameRepository: { connect: jest.Mock };
  let pairGameQueryRepository: { getPairGameView: jest.Mock };

  const view: PairGameViewModel = {
    id: 'pair-1',
    status: PairGameStatus.PendingSecondPlayer,
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
        ConnectPairGameUseCase,
        { provide: PairGameRepository, useValue: { connect: jest.fn() } },
        { provide: PairGameQueryRepository, useValue: { getPairGameView: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(ConnectPairGameUseCase);
    pairGameRepository = module.get(PairGameRepository);
    pairGameQueryRepository = module.get(PairGameQueryRepository);
  });

  it('connects user and returns pair game view', async () => {
    pairGameRepository.connect.mockResolvedValue('pair-1');
    pairGameQueryRepository.getPairGameView.mockResolvedValue(view);

    await expect(useCase.execute('u1')).resolves.toEqual(view);
    expect(pairGameRepository.connect).toHaveBeenCalledWith('u1');
  });

  it('throws InternalServerError when view is missing after connect', async () => {
    pairGameRepository.connect.mockResolvedValue('pair-1');
    pairGameQueryRepository.getPairGameView.mockResolvedValue(null);

    await expect(useCase.execute('u1')).rejects.toThrow(DomainException);
    await expect(useCase.execute('u1')).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
