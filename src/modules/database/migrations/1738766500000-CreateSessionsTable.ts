import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1738766500000 implements MigrationInterface {
  name = 'CreateSessionsTable1738766500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "device_id" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "ip" character varying NOT NULL,
        "title" character varying NOT NULL,
        "last_active_date" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_sessions_device_id" PRIMARY KEY ("device_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sessions_user_id"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
