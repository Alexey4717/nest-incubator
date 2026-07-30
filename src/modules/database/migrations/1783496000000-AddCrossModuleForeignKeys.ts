import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCrossModuleForeignKeys1783496000000 implements MigrationInterface {
  name = 'AddCrossModuleForeignKeys1783496000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
      ADD CONSTRAINT "FK_posts_blog_id" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sessions"
      ADD CONSTRAINT "FK_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_post_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_blog_id"
    `);
  }
}
