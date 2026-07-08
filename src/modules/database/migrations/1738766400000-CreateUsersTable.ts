import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1738766400000 implements MigrationInterface {
  name = 'CreateUsersTable1738766400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "login" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL,
        "confirmation_code" character varying,
        "confirmation_expiration" TIMESTAMPTZ,
        "is_confirmed" boolean NOT NULL,
        "recovery_code" character varying,
        "recovery_expiration" TIMESTAMPTZ,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_login" UNIQUE ("login"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_confirmation_code" UNIQUE ("confirmation_code")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_recovery_code_partial"
      ON "users" ("recovery_code")
      WHERE "recovery_code" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_recovery_code_partial"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
