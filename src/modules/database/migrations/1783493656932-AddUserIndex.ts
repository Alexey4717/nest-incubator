import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIndex1783493656932 implements MigrationInterface {
  name = 'AddUserIndex1783493656932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" DROP CONSTRAINT "FK_comment_reactions_comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_reactions" DROP CONSTRAINT "FK_post_reactions_post_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_users_recovery_code_partial"`);
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" ADD CONSTRAINT "FK_dc714054fc62b698018fcb0ae37" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_reactions" ADD CONSTRAINT "FK_595c9605f31a27c0c557c5befb9" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_reactions" DROP CONSTRAINT "FK_595c9605f31a27c0c557c5befb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" DROP CONSTRAINT "FK_dc714054fc62b698018fcb0ae37"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_recovery_code_partial" ON "users" USING btree ("recovery_code") WHERE (recovery_code IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_user_id" ON "sessions" USING btree ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "post_reactions" ADD CONSTRAINT "FK_post_reactions_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" ADD CONSTRAINT "FK_comment_reactions_comment_id" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
