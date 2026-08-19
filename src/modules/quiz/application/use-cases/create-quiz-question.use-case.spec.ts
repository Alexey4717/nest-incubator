import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { QuizQuestionEntity } from '../../domain/entities/quiz-question.entity';
import { CreateQuizQuestionDto } from '../../dto/quiz-question.dto';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { CreateQuizQuestionUseCase } from './create-quiz-question.use-case';

describe('CreateQuizQuestionUseCase', () => {
  let useCase: CreateQuizQuestionUseCase;
  let quizQuestionRepository: { create: jest.Mock };

  const dto = (overrides: Partial<CreateQuizQuestionDto> = {}): CreateQuizQuestionDto =>
    Object.assign(new CreateQuizQuestionDto(), {
      body: 'What is the capital of France?',
      correctAnswers: ['Paris'],
      ...overrides,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateQuizQuestionUseCase,
        {
          provide: QuizQuestionRepository,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateQuizQuestionUseCase);
    quizQuestionRepository = module.get(QuizQuestionRepository);
  });

  it('creates unpublished question and returns Notification.ok', async () => {
    const saved = QuizQuestionEntity.create({
      body: 'What is the capital of France?',
      correctAnswers: ['Paris'],
    });
    quizQuestionRepository.create.mockResolvedValue(saved);

    const result = await useCase.execute(dto());

    expect(quizQuestionRepository.create).toHaveBeenCalledWith(expect.any(QuizQuestionEntity));
    expect(result).toMatchObject({
      data: {
        id: saved.id,
        body: 'What is the capital of France?',
        correctAnswers: ['Paris'],
        published: false,
        updatedAt: null,
      },
    });
  });

  it('throws InternalServerError when create returns null', async () => {
    quizQuestionRepository.create.mockResolvedValue(null);

    await expect(useCase.execute(dto())).rejects.toThrow(DomainException);
    await expect(useCase.execute(dto())).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
