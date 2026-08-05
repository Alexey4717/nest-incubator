import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_pair_questions')
@Index('UQ_quiz_pair_questions_pair_order', ['pairId', 'order'], { unique: true })
@Index('IDX_quiz_pair_questions_pair_id', ['pairId'])
export class QuizPairQuestionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'pair_id', type: 'bigint' })
  pairId: string;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @Column({ type: 'smallint' })
  order: number;
}
