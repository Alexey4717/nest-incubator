import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { QuizQuestionEntity } from '../../domain/entities/quiz-question.entity';
import { PublishQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { PublishQuizQuestionUseCase } from './publish-quiz-question.use-case';

describe('PublishQuizQuestionUseCase', () => {
  let useCase: PublishQuizQuestionUseCase;
  let quizQuestionRepository: { findById: jest.Mock; save: jest.Mock };

  const dto = (published: boolean): PublishQuizQuestionDto =>
    Object.assign(new PublishQuizQuestionDto(), { published });

  const questionWithAnswers = () =>
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
        PublishQuizQuestionUseCase,
        {
          provide: QuizQuestionRepository,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(PublishQuizQuestionUseCase);
    quizQuestionRepository = module.get(QuizQuestionRepository);
  });

  it('publishes question and returns Notification.ok(null)', async () => {
    const question = questionWithAnswers();
    quizQuestionRepository.findById.mockResolvedValue(question);
    quizQuestionRepository.save.mockResolvedValue(question);

    const result = await useCase.execute({ id: 'q-1', input: dto(true) });

    expect(question.published).toBe(true);
    expect(quizQuestionRepository.save).toHaveBeenCalledWith(question);
    expect(result).toEqual(Notification.ok(null));
  });

  it('unpublishes question and returns Notification.ok(null)', async () => {
    const question = QuizQuestionEntity.reconstitute({
      id: 'q-1',
      body: 'What is 2+2?',
      correctAnswers: ['4'],
      published: true,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: null,
    });
    quizQuestionRepository.findById.mockResolvedValue(question);
    quizQuestionRepository.save.mockResolvedValue(question);

    const result = await useCase.execute({ id: 'q-1', input: dto(false) });

    expect(question.published).toBe(false);
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when question does not exist', async () => {
    quizQuestionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'missing', input: dto(true) });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(quizQuestionRepository.save).not.toHaveBeenCalled();
  });

  it('returns BadRequest when publishing without correctAnswers', async () => {
    const question = QuizQuestionEntity.reconstitute({
      id: 'q-1',
      body: 'Empty answers question',
      correctAnswers: [],
      published: false,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      updatedAt: null,
    });
    quizQuestionRepository.findById.mockResolvedValue(question);

    const result = await useCase.execute({ id: 'q-1', input: dto(true) });

    expect(result).toMatchObject({
      code: DomainExceptionCode.BadRequest,
      messages: [{ field: 'correctAnswers' }],
    });
    expect(quizQuestionRepository.save).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when save returns null', async () => {
    const question = questionWithAnswers();
    quizQuestionRepository.findById.mockResolvedValue(question);
    quizQuestionRepository.save.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'q-1', input: dto(true) })).rejects.toThrow(DomainException);
    await expect(useCase.execute({ id: 'q-1', input: dto(true) })).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
