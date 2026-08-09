import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';

import { QuizQuestionEntity } from '../../domain/entities/quiz-question.entity';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { DeleteQuizQuestionUseCase } from './delete-quiz-question.use-case';

describe('DeleteQuizQuestionUseCase', () => {
  let useCase: DeleteQuizQuestionUseCase;
  let quizQuestionRepository: { findById: jest.Mock; deleteById: jest.Mock };

  const existingQuestion = () =>
    QuizQuestionEntity.reconstitute({
      id: 'q-1',
      body: 'What is 2+2?',
      correctAnswers: ['4'],
      published: false,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: null,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteQuizQuestionUseCase,
        {
          provide: QuizQuestionRepository,
          useValue: { findById: jest.fn(), deleteById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(DeleteQuizQuestionUseCase);
    quizQuestionRepository = module.get(QuizQuestionRepository);
  });

  it('deletes question and returns Result.ok(null)', async () => {
    quizQuestionRepository.findById.mockResolvedValue(existingQuestion());
    quizQuestionRepository.deleteById.mockResolvedValue(true);

    const result = await useCase.execute('q-1');

    expect(quizQuestionRepository.deleteById).toHaveBeenCalledWith('q-1');
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });

  it('returns NotFound when question does not exist', async () => {
    quizQuestionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.NotFound,
      extensions: [],
    });
    expect(quizQuestionRepository.deleteById).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when delete returns false', async () => {
    quizQuestionRepository.findById.mockResolvedValue(existingQuestion());
    quizQuestionRepository.deleteById.mockResolvedValue(false);

    await expect(useCase.execute('q-1')).rejects.toThrow(DomainException);
    await expect(useCase.execute('q-1')).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
