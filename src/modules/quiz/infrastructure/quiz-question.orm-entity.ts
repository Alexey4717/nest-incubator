import { Column, Entity, Index } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

@Entity('quiz_questions')
@Index('IDX_quiz_questions_created_at', ['createdAt'])
@Index('IDX_quiz_questions_published', ['published'])
export class QuizQuestionOrmEntity extends BaseOrmEntity {
  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'correct_answers', type: 'jsonb', default: [] })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
