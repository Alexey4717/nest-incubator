import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsAndReactionsTables1738766800000 implements MigrationInterface {
  name = 'CreateCommentsAndReactionsTables1738766800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "content" character varying NOT NULL,
        "user_id" character varying NOT NULL,
        "user_login" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comment_reactions" (
        "comment_id" uuid NOT NULL,
        "user_id" character varying NOT NULL,
        "like_status" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_comment_reactions" PRIMARY KEY ("comment_id", "user_id"),
        CONSTRAINT "FK_comment_reactions_comment_id" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "comment_reactions"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
