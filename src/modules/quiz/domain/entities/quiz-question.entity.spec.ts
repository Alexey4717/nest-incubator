import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { QuizQuestionDb, QuizQuestionEntity } from './quiz-question.entity';

describe('QuizQuestionEntity', () => {
  const baseDb = (overrides: Partial<QuizQuestionDb> = {}): QuizQuestionDb => ({
    id: 'q-1',
    body: '2+2?',
    correctAnswers: ['4'],
    published: false,
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    updatedAt: null,
    ...overrides,
  });

  it('creates unpublished question', () => {
    const question = QuizQuestionEntity.create({
      body: '2+2?',
      correctAnswers: ['4'],
    });

    const db = question.toDb();
    expect(db.body).toBe('2+2?');
    expect(db.correctAnswers).toEqual(['4']);
    expect(db.published).toBe(false);
    expect(db.updatedAt).toBeNull();
  });

  it('reconstitutes and normalizes dates from strings', () => {
    const question = QuizQuestionEntity.reconstitute({
      ...baseDb(),
      createdAt: '2021-01-01T00:00:00.000Z' as unknown as Date,
      updatedAt: '2021-02-01T00:00:00.000Z' as unknown as Date,
    });

    expect(question.toDb().createdAt).toEqual(new Date('2021-01-01T00:00:00.000Z'));
    expect(question.toDb().updatedAt).toEqual(new Date('2021-02-01T00:00:00.000Z'));
  });

  it('updates body and answers for draft question', () => {
    const question = QuizQuestionEntity.reconstitute(baseDb());

    question.update({ body: '3+3?', correctAnswers: ['6'] });

    expect(question.toDb().body).toBe('3+3?');
    expect(question.correctAnswers).toEqual(['6']);
    expect(question.toDb().updatedAt).toBeInstanceOf(Date);
  });

  it('forbids clearing answers on published question', () => {
    const question = QuizQuestionEntity.reconstitute(baseDb({ published: true }));

    expect(() => question.update({ body: 'x', correctAnswers: [] })).toThrow(DomainException);
    try {
      question.update({ body: 'x', correctAnswers: [] });
    } catch (e) {
      expect(e).toMatchObject({
        code: DomainExceptionCode.BadRequest,
        extensions: [{ field: 'correctAnswers' }],
      });
    }
  });

  it('publishes when answers exist and unpublishes freely', () => {
    const question = QuizQuestionEntity.reconstitute(baseDb());

    question.setPublished(true);
    expect(question.published).toBe(true);

    question.setPublished(false);
    expect(question.published).toBe(false);
  });

  it('rejects publish without correct answers', () => {
    const question = QuizQuestionEntity.reconstitute(baseDb({ correctAnswers: [] }));

    expect(() => question.setPublished(true)).toThrow(DomainException);
  });
});
