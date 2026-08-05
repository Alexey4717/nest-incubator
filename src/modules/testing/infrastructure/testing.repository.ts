import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await this.dataSource.query(`
        TRUNCATE TABLE
          "comment_reactions",
          "comments",
          "post_reactions",
          "posts",
          "blogs",
          "sessions",
          "users"
        RESTART IDENTITY CASCADE
      `);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Образец QueryBuilder INSERT (лекция QueryBuilder).
   * Только для обучения — не вызывается из production command-side.
   */
  async demoInsertUserViaQueryBuilder(values: Partial<UserOrmEntity>): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(UserOrmEntity)
      .values(values)
      .execute();
  }

  /**
   * Образец QueryBuilder UPDATE (лекция QueryBuilder).
   * Только для обучения — не вызывается из production command-side.
   */
  async demoUpdateUserViaQueryBuilder(
    userId: string,
    values: Partial<Pick<UserOrmEntity, 'login' | 'email'>>,
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(UserOrmEntity)
      .set(values)
      .where('public_id = :userId', { userId })
      .execute();
  }

  /**
   * Образец QueryBuilder DELETE (лекция QueryBuilder).
   * Только для обучения — не вызывается из production command-side.
   */
  async demoDeleteUserViaQueryBuilder(userId: string): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(UserOrmEntity)
      .where('public_id = :userId', { userId })
      .execute();
  }
}
