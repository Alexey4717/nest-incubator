import { Column, Entity, Index } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

import { PairGameStatus } from '../domain/pair-game-status.enum';

@Entity('quiz_pairs')
@Index('IDX_quiz_pairs_status', ['status'])
@Index('IDX_quiz_pairs_first_player_user_id', ['firstPlayerUserId'])
@Index('IDX_quiz_pairs_second_player_user_id', ['secondPlayerUserId'])
@Index('IDX_quiz_pairs_pending_matchmaking', ['status'], {
  where: `"status" = 'PendingSecondPlayer'`,
})
export class QuizPairOrmEntity extends BaseOrmEntity {
  @Column({ name: 'first_player_user_id', type: 'bigint' })
  firstPlayerUserId: string;

  @Column({ name: 'second_player_user_id', type: 'bigint', nullable: true })
  secondPlayerUserId: string | null;

  @Column({ type: 'varchar' })
  status: PairGameStatus;

  @Column({ name: 'start_game_date', type: 'timestamptz', nullable: true })
  startGameDate: Date | null;

  @Column({ name: 'finish_game_date', type: 'timestamptz', nullable: true })
  finishGameDate: Date | null;

  @Column({ name: 'first_player_score', type: 'int', nullable: true })
  firstPlayerScore: number | null;

  @Column({ name: 'second_player_score', type: 'int', nullable: true })
  secondPlayerScore: number | null;

  @Column({ name: 'first_player_finished_at', type: 'timestamptz', nullable: true })
  firstPlayerFinishedAt: Date | null;

  @Column({ name: 'second_player_finished_at', type: 'timestamptz', nullable: true })
  secondPlayerFinishedAt: Date | null;
}
