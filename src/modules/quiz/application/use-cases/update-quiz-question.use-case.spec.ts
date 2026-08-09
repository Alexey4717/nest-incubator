import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';

import { QuizQuestionEntity } from '../../domain/entities/quiz-question.entity';
import { UpdateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { UpdateQuizQuestionUseCase } from './update-quiz-question.use-case';

describe('UpdateQuizQuestionUseCase', () => {
  let useCase: UpdateQuizQuestionUseCase;
  let quizQuestionRepository: { findById: jest.Mock; save: jest.Mock };

  const dto = (overrides: Partial<UpdateQuizQuestionDto> = {}): UpdateQuizQuestionDto =>
    Object.assign(new UpdateQuizQuestionDto(), {
      body: 'Updated question body text',
      correctAnswers: ['answer'],
      ...overrides,
    });

  const draftQuestion = () =>
    QuizQuestionEntity.reconstitute({
      id: 'q-1',
      body: 'Original question body',
      correctAnswers: ['old'],
      published: false,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: null,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateQuizQuestionUseCase,
        {
          provide: QuizQuestionRepository,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(UpdateQuizQuestionUseCase);
    quizQuestionRepository = module.get(QuizQuestionRepository);
  });

  it('updates question and returns Result.ok(null)', async () => {
    const question = draftQuestion();
    quizQuestionRepository.findById.mockResolvedValue(question);
    quizQuestionRepository.save.mockResolvedValue(question);

    const result = await useCase.execute({ id: 'q-1', input: dto() });

    expect(question.toDb().body).toBe('Updated question body text');
    expect(question.correctAnswers).toEqual(['answer']);
    expect(quizQuestionRepository.save).toHaveBeenCalledWith(question);
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });

  it('returns NotFound when question does not exist', async () => {
    quizQuestionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'missing', input: dto() });

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.NotFound,
      extensions: [],
    });
    expect(quizQuestionRepository.save).not.toHaveBeenCalled();
  });

  it('returns BadRequest when entity update throws DomainException', async () => {
    const question = draftQuestion();
    quizQuestionRepository.findById.mockResolvedValue(question);
    jest.spyOn(question, 'update').mockImplementation(() => {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'correctAnswers is required for published question', field: 'correctAnswers' },
      ]);
    });

    const result = await useCase.execute({ id: 'q-1', input: dto() });

    expect(result).toMatchObject({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.BadRequest,
      extensions: [{ field: 'correctAnswers' }],
    });
    expect(quizQuestionRepository.save).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when save returns null', async () => {
    const question = draftQuestion();
    quizQuestionRepository.findById.mockResolvedValue(question);
    quizQuestionRepository.save.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'q-1', input: dto() })).rejects.toThrow(DomainException);
    await expect(useCase.execute({ id: 'q-1', input: dto() })).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
