import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1783497000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1783497000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_user_id" ON "sessions" USING btree ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_recovery_code_partial" ON "users" USING btree ("recovery_code") WHERE (recovery_code IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_blog_id_created_at" ON "posts" USING btree ("blog_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_post_id_created_at" ON "comments" USING btree ("post_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_last_active_date" ON "sessions" USING btree ("last_active_date")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_blogs_name" ON "blogs" USING btree ("name")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_created_at" ON "users" USING btree ("created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blogs_created_at" ON "blogs" USING btree ("created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_blogs_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_blogs_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_last_active_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_comments_post_id_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_blog_id_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_users_recovery_code_partial"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_user_id"`);
  }
}
