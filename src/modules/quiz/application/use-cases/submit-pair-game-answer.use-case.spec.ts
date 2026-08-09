import { Test, TestingModule } from '@nestjs/testing';

import { AnswerStatus } from '../../domain/pair-game-status.enum';
import { SubmitPairGameAnswerDto } from '../../dto/pair-game.dto';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { SubmitPairGameAnswerUseCase } from './submit-pair-game-answer.use-case';

describe('SubmitPairGameAnswerUseCase', () => {
  let useCase: SubmitPairGameAnswerUseCase;
  let pairGameRepository: { submitAnswer: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitPairGameAnswerUseCase,
        { provide: PairGameRepository, useValue: { submitAnswer: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(SubmitPairGameAnswerUseCase);
    pairGameRepository = module.get(PairGameRepository);
  });

  it('validates input and submits answer', async () => {
    const answerResult = {
      questionId: 'q-1',
      answerStatus: AnswerStatus.Correct,
      addedAt: '2024-01-01T00:00:00.000Z',
    };
    pairGameRepository.submitAnswer.mockResolvedValue(answerResult);

    const input = Object.assign(new SubmitPairGameAnswerDto(), { answer: 'Paris' });
    await expect(useCase.execute({ userId: 'u1', input })).resolves.toEqual(answerResult);
    expect(pairGameRepository.submitAnswer).toHaveBeenCalledWith('u1', 'Paris');
  });

  it('rejects empty answer before repository call', async () => {
    const input = Object.assign(new SubmitPairGameAnswerDto(), { answer: '' });

    await expect(useCase.execute({ userId: 'u1', input })).rejects.toThrow();
    expect(pairGameRepository.submitAnswer).not.toHaveBeenCalled();
  });
});
