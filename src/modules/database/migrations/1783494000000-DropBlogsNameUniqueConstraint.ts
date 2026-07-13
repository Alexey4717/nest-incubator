import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBlogsNameUniqueConstraint1783494000000 implements MigrationInterface {
  name = 'DropBlogsNameUniqueConstraint1783494000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT IF EXISTS "UQ_blogs_name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "UQ_blogs_name" UNIQUE ("name")`);
  }
}
