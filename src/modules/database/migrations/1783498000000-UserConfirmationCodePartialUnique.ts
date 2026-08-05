import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserConfirmationCodePartialUnique1783498000000 implements MigrationInterface {
  name = 'UserConfirmationCodePartialUnique1783498000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_confirmation_code"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_confirmation_code_partial" ON "users" USING btree ("confirmation_code") WHERE ("confirmation_code" IS NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_users_confirmation_code_partial"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_confirmation_code" UNIQUE ("confirmation_code")`,
    );
  }
}
