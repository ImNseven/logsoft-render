import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1713000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('shipper', 'carrier', 'dispatcher')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "phone" VARCHAR(20) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "role" "user_role_enum" NOT NULL,
        "full_name" VARCHAR(255),
        "company_name" VARCHAR(255),
        "is_admin" BOOLEAN NOT NULL DEFAULT false,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_phone" ON "users" ("phone")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_role" ON "users" ("role")
    `);

    await queryRunner.query(`
      CREATE TABLE "origin_points" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_origin_points" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transport_types" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transport_types" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transport_types"`);
    await queryRunner.query(`DROP TABLE "origin_points"`);
    await queryRunner.query(`DROP INDEX "idx_users_role"`);
    await queryRunner.query(`DROP INDEX "idx_users_phone"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
