import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_pair_answers')
@Index('UQ_quiz_pair_answers_pair_user_question', ['pairId', 'userId', 'questionId'], {
  unique: true,
})
@Index('IDX_quiz_pair_answers_pair_id', ['pairId'])
export class QuizPairAnswerOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'pair_id', type: 'bigint' })
  pairId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @Column({ type: 'varchar' })
  answer: string;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @Column({ name: 'answered_at', type: 'timestamptz' })
  answeredAt: Date;
}
