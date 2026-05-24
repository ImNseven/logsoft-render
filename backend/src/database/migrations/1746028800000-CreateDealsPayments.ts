import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDealsPayments1746028800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "deals_status_enum" AS ENUM (
        'pending', 'paid', 'documents_revealed', 'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payments_status_enum" AS ENUM (
        'pending', 'qr_sent', 'confirmed'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "deals" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "load_id" UUID NOT NULL,
        "vehicle_id" UUID NOT NULL,
        "shipper_id" UUID NOT NULL,
        "carrier_id" UUID NOT NULL,
        "dispatcher_id" UUID NOT NULL,
        "status" "deals_status_enum" NOT NULL DEFAULT 'pending',
        "vehicle_replaced" BOOLEAN NOT NULL DEFAULT false,
        "documents_revealed_at" TIMESTAMPTZ,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_deals_load" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_deals_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_deals_shipper" FOREIGN KEY ("shipper_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_deals_carrier" FOREIGN KEY ("carrier_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_deals_dispatcher" FOREIGN KEY ("dispatcher_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_deals_status" ON "deals" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_deals_dispatcher_id" ON "deals" ("dispatcher_id")`);
    await queryRunner.query(`CREATE INDEX "idx_deals_shipper_id" ON "deals" ("shipper_id")`);
    await queryRunner.query(`CREATE INDEX "idx_deals_carrier_id" ON "deals" ("carrier_id")`);
    await queryRunner.query(`CREATE INDEX "idx_deals_load_id" ON "deals" ("load_id")`);
    await queryRunner.query(`CREATE INDEX "idx_deals_vehicle_id" ON "deals" ("vehicle_id")`);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uniq_deals_active_load"
        ON "deals" ("load_id")
        WHERE status <> 'cancelled'
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "deal_id" UUID NOT NULL,
        "payer_id" UUID NOT NULL,
        "amount" DECIMAL(12,2),
        "qr_code_url" VARCHAR(500),
        "qr_file_name" VARCHAR(255),
        "qr_mime_type" VARCHAR(100),
        "status" "payments_status_enum" NOT NULL DEFAULT 'pending',
        "confirmed_by" UUID,
        "confirmed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_deal_id" UNIQUE ("deal_id"),
        CONSTRAINT "FK_payments_deal" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payments_payer" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_payments_confirmed_by" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "idx_payments_deal_id" ON "payments" ("deal_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_status" ON "payments" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_deal_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "uniq_deals_active_load"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deals_vehicle_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deals_load_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deals_carrier_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deals_shipper_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deals_dispatcher_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deals_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deals"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "payments_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "deals_status_enum"`);
  }
}
