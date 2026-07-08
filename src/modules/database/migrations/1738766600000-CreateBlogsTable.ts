import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogsTable1738766600000 implements MigrationInterface {
  name = 'CreateBlogsTable1738766600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blogs" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "website_url" character varying NOT NULL,
        "description" character varying NOT NULL,
        "is_membership" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_blogs_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blogs_name" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blogs"`);
  }
}
