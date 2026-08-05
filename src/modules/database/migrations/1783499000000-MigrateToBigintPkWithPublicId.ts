import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateToBigintPkWithPublicId1783499000000 implements MigrationInterface {
  name = 'MigrateToBigintPkWithPublicId1783499000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "FK_sessions_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "FK_posts_blog_id"`);
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_comments_post_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_reactions" DROP CONSTRAINT IF EXISTS "FK_post_reactions_post_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_reactions" DROP CONSTRAINT IF EXISTS "FK_595c9605f31a27c0c557c5befb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" DROP CONSTRAINT IF EXISTS "FK_comment_reactions_comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" DROP CONSTRAINT IF EXISTS "FK_dc714054fc62b698018fcb0ae37"`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_blog_id_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comments_post_id_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sessions_user_id"`);

    await this.migrateMainEntity(queryRunner, 'users');
    await this.migrateMainEntity(queryRunner, 'blogs');

    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "public_id" uuid`);
    await queryRunner.query(`UPDATE "posts" SET "public_id" = "id"`);
    await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "public_id" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "blog_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "posts" p
      SET "blog_id_new" = b."id"
      FROM "blogs" b
      WHERE p."blog_id" = b."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "blog_id"`);
    await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "blog_id_new" TO "blog_id"`);
    await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "blog_id" SET NOT NULL`);

    await this.swapPrimaryKey(queryRunner, 'posts');
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_posts_public_id" ON "posts" ("public_id")`);

    await queryRunner.query(`ALTER TABLE "comments" ADD COLUMN "public_id" uuid`);
    await queryRunner.query(`UPDATE "comments" SET "public_id" = "id"`);
    await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "public_id" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "comments" ADD COLUMN "post_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "comments" c
      SET "post_id_new" = p."id"
      FROM "posts" p
      WHERE c."post_id"::uuid = p."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "post_id_new" TO "post_id"`);
    await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "post_id" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "comments" ADD COLUMN "user_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "comments" c
      SET "user_id_new" = u."id"
      FROM "users" u
      WHERE c."user_id"::uuid = u."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "user_id_new" TO "user_id"`);
    await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "user_id" SET NOT NULL`);

    await this.swapPrimaryKey(queryRunner, 'comments');
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_comments_public_id" ON "comments" ("public_id")`,
    );

    await queryRunner.query(`ALTER TABLE "sessions" ADD COLUMN "user_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "sessions" s
      SET "user_id_new" = u."id"
      FROM "users" u
      WHERE s."user_id" = u."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "user_id_new" TO "user_id"`);
    await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "user_id" SET NOT NULL`);

    await this.migratePostReactions(queryRunner);
    await this.migrateCommentReactions(queryRunner);

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

    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_user_id" ON "sessions" USING btree ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_blog_id_created_at" ON "posts" USING btree ("blog_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_post_id_created_at" ON "comments" USING btree ("post_id", "created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('MigrateToBigintPkWithPublicId1783499000000 down is not supported');
  }

  private async migrateMainEntity(queryRunner: QueryRunner, table: string): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "public_id" uuid`);
    await queryRunner.query(`UPDATE "${table}" SET "public_id" = "id"`);
    await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "public_id" SET NOT NULL`);
    await this.swapPrimaryKey(queryRunner, table);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_${table}_public_id" ON "${table}" ("public_id")`,
    );
  }

  private async swapPrimaryKey(queryRunner: QueryRunner, table: string): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "new_id" bigint`);
    await queryRunner.query(`
      UPDATE "${table}" t
      SET "new_id" = sub.rn
      FROM (
        SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS rn
        FROM "${table}"
      ) sub
      WHERE t."id" = sub."id"
    `);
    await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "new_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT "PK_${table}_id"`);
    await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "new_id" TO "id"`);
    await queryRunner.query(
      `ALTER TABLE "${table}" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY`,
    );
    await queryRunner.query(`
      SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE((SELECT MAX("id") FROM "${table}"), 1)
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "${table}" ADD CONSTRAINT "PK_${table}_id" PRIMARY KEY ("id")`,
    );
  }

  private async migratePostReactions(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_reactions" DROP CONSTRAINT IF EXISTS "PK_post_reactions"`,
    );

    await queryRunner.query(`ALTER TABLE "post_reactions" ADD COLUMN "post_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "post_reactions" r
      SET "post_id_new" = p."id"
      FROM "posts" p
      WHERE r."post_id" = p."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "post_reactions" DROP COLUMN "post_id"`);
    await queryRunner.query(
      `ALTER TABLE "post_reactions" RENAME COLUMN "post_id_new" TO "post_id"`,
    );
    await queryRunner.query(`ALTER TABLE "post_reactions" ALTER COLUMN "post_id" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "post_reactions" ADD COLUMN "user_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "post_reactions" r
      SET "user_id_new" = u."id"
      FROM "users" u
      WHERE r."user_id"::uuid = u."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "post_reactions" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "post_reactions" RENAME COLUMN "user_id_new" TO "user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "post_reactions" ALTER COLUMN "user_id" SET NOT NULL`);

    await queryRunner.query(
      `ALTER TABLE "post_reactions" ADD CONSTRAINT "PK_post_reactions" PRIMARY KEY ("post_id", "user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "post_reactions"
      ADD CONSTRAINT "FK_post_reactions_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "post_reactions"
      ADD CONSTRAINT "FK_post_reactions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  private async migrateCommentReactions(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" DROP CONSTRAINT IF EXISTS "PK_comment_reactions"`,
    );

    await queryRunner.query(`ALTER TABLE "comment_reactions" ADD COLUMN "comment_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "comment_reactions" r
      SET "comment_id_new" = c."id"
      FROM "comments" c
      WHERE r."comment_id" = c."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "comment_reactions" DROP COLUMN "comment_id"`);
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" RENAME COLUMN "comment_id_new" TO "comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" ALTER COLUMN "comment_id" SET NOT NULL`,
    );

    await queryRunner.query(`ALTER TABLE "comment_reactions" ADD COLUMN "user_id_new" bigint`);
    await queryRunner.query(`
      UPDATE "comment_reactions" r
      SET "user_id_new" = u."id"
      FROM "users" u
      WHERE r."user_id"::uuid = u."public_id"
    `);
    await queryRunner.query(`ALTER TABLE "comment_reactions" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "comment_reactions" RENAME COLUMN "user_id_new" TO "user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "comment_reactions" ALTER COLUMN "user_id" SET NOT NULL`);

    await queryRunner.query(
      `ALTER TABLE "comment_reactions" ADD CONSTRAINT "PK_comment_reactions" PRIMARY KEY ("comment_id", "user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "comment_reactions"
      ADD CONSTRAINT "FK_comment_reactions_comment_id" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "comment_reactions"
      ADD CONSTRAINT "FK_comment_reactions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }
}
