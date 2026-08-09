import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { generatePublicId } from '@/core/utils/public-id.generator';

export type QuizQuestionCreateProps = {
  body: string;
  correctAnswers: string[];
};

export type QuizQuestionUpdateProps = {
  body: string;
  correctAnswers: string[];
};

export type QuizQuestionDb = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export class QuizQuestionEntity {
  private constructor(private data: QuizQuestionDb) {}

  static create(props: QuizQuestionCreateProps): QuizQuestionEntity {
    return new QuizQuestionEntity({
      id: generatePublicId(),
      body: props.body,
      correctAnswers: props.correctAnswers,
      published: false,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static reconstitute(raw: QuizQuestionDb): QuizQuestionEntity {
    return new QuizQuestionEntity({
      id: raw.id,
      body: raw.body,
      correctAnswers: raw.correctAnswers,
      published: raw.published,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt),
      updatedAt: raw.updatedAt
        ? raw.updatedAt instanceof Date
          ? raw.updatedAt
          : new Date(raw.updatedAt)
        : null,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get published(): boolean {
    return this.data.published;
  }

  get correctAnswers(): string[] {
    return this.data.correctAnswers;
  }

  toDb(): QuizQuestionDb {
    return { ...this.data };
  }

  update(props: QuizQuestionUpdateProps): void {
    if (this.data.published && (!props.correctAnswers || props.correctAnswers.length === 0)) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'correctAnswers is required for published question', field: 'correctAnswers' },
      ]);
    }

    this.data = {
      ...this.data,
      body: props.body,
      correctAnswers: props.correctAnswers,
      updatedAt: new Date(),
    };
  }

  setPublished(published: boolean): void {
    if (published && this.data.correctAnswers.length === 0) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Cannot publish question without correctAnswers', field: 'correctAnswers' },
      ]);
    }

    this.data = {
      ...this.data,
      published,
      updatedAt: new Date(),
    };
  }
}
