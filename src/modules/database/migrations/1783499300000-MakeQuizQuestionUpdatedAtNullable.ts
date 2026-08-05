import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeQuizQuestionUpdatedAtNullable1783499300000 implements MigrationInterface {
  name = 'MakeQuizQuestionUpdatedAtNullable1783499300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quiz_questions"
      ALTER COLUMN "updated_at" DROP NOT NULL,
      ALTER COLUMN "updated_at" DROP DEFAULT
    `);

    await queryRunner.query(`
      UPDATE "quiz_questions"
      SET "updated_at" = NULL
      WHERE "updated_at" IS NOT NULL
        AND "updated_at" = "created_at"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "quiz_questions"
      SET "updated_at" = "created_at"
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "quiz_questions"
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);
  }
}
