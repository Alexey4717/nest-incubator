import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsAndReactionsTables1738766700000 implements MigrationInterface {
  name = 'CreatePostsAndReactionsTables1738766700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "short_description" character varying NOT NULL,
        "content" character varying NOT NULL,
        "blog_id" uuid NOT NULL,
        "blog_name" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "post_reactions" (
        "post_id" uuid NOT NULL,
        "user_id" character varying NOT NULL,
        "user_login" character varying NOT NULL,
        "like_status" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_post_reactions" PRIMARY KEY ("post_id", "user_id"),
        CONSTRAINT "FK_post_reactions_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post_reactions"`);
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
