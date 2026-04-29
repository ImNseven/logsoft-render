import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertEnumColumns1745856000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "loads_status_enum" AS ENUM (
        'active', 'in_deal', 'completed', 'cancelled'
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "loads" DROP CONSTRAINT "CHK_loads_status"`,
    );
    await queryRunner.query(`ALTER TABLE "loads" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE "loads"
        ALTER COLUMN "status" TYPE "loads_status_enum"
        USING "status"::"loads_status_enum"
    `);
    await queryRunner.query(
      `ALTER TABLE "loads" ALTER COLUMN "status" SET DEFAULT 'active'::"loads_status_enum"`,
    );

    await queryRunner.query(`
      CREATE TYPE "vehicle_documents_doc_type_enum" AS ENUM (
        'tech_passport_truck',
        'tech_passport_trailer',
        'passport',
        'permit_kat',
        'chip',
        'other'
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "vehicle_documents" DROP CONSTRAINT "CHK_vdocs_doc_type"`,
    );
    await queryRunner.query(`
      ALTER TABLE "vehicle_documents"
        ALTER COLUMN "doc_type" TYPE "vehicle_documents_doc_type_enum"
        USING "doc_type"::"vehicle_documents_doc_type_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicle_documents"
        ALTER COLUMN "doc_type" TYPE VARCHAR(30)
        USING "doc_type"::text
    `);
    await queryRunner.query(`
      ALTER TABLE "vehicle_documents"
        ADD CONSTRAINT "CHK_vdocs_doc_type"
        CHECK (doc_type IN ('tech_passport_truck','tech_passport_trailer','passport','permit_kat','chip','other'))
    `);
    await queryRunner.query(`DROP TYPE "vehicle_documents_doc_type_enum"`);

    await queryRunner.query(`ALTER TABLE "loads" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE "loads"
        ALTER COLUMN "status" TYPE VARCHAR(20)
        USING "status"::text
    `);
    await queryRunner.query(
      `ALTER TABLE "loads" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(`
      ALTER TABLE "loads"
        ADD CONSTRAINT "CHK_loads_status"
        CHECK (status IN ('active','in_deal','completed','cancelled'))
    `);
    await queryRunner.query(`DROP TYPE "loads_status_enum"`);
  }
}
