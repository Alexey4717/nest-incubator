import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentRefreshTokenJtiToSessions1783495000000 implements MigrationInterface {
  name = 'AddCurrentRefreshTokenJtiToSessions1783495000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessions"
      ADD COLUMN "current_refresh_token_jti" character varying NOT NULL DEFAULT gen_random_uuid()::text
    `);
    await queryRunner.query(`
      ALTER TABLE "sessions"
      ALTER COLUMN "current_refresh_token_jti" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessions" DROP COLUMN "current_refresh_token_jti"
    `);
  }
}
