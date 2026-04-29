import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoadsVehiclesDocs1745683200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "loads" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "shipper_id" UUID NOT NULL,
        "created_by" UUID NOT NULL,
        "origin_point_id" INT NOT NULL,
        "destination" VARCHAR(500) NOT NULL,
        "transport_type_id" INT,
        "weight_kg" DECIMAL(10,2),
        "volume_m3" DECIMAL(10,2),
        "ready_date" DATE,
        "status" VARCHAR(20) NOT NULL DEFAULT 'active'
          CONSTRAINT "CHK_loads_status" CHECK (status IN ('active','in_deal','completed','cancelled')),
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_loads" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loads_shipper" FOREIGN KEY ("shipper_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_loads_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id"),
        CONSTRAINT "FK_loads_origin_point" FOREIGN KEY ("origin_point_id") REFERENCES "origin_points"("id"),
        CONSTRAINT "FK_loads_transport_type" FOREIGN KEY ("transport_type_id") REFERENCES "transport_types"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_loads_shipper_id" ON "loads" ("shipper_id")`);
    await queryRunner.query(`CREATE INDEX "idx_loads_status" ON "loads" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_loads_origin_point_id" ON "loads" ("origin_point_id")`);

    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "carrier_id" UUID NOT NULL,
        "created_by" UUID NOT NULL,
        "plate_number" VARCHAR(20) NOT NULL,
        "vehicle_type" VARCHAR(100),
        "specs" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vehicles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vehicles_carrier" FOREIGN KEY ("carrier_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_vehicles_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_vehicles_carrier_id" ON "vehicles" ("carrier_id")`);
    await queryRunner.query(`CREATE INDEX "idx_vehicles_is_active" ON "vehicles" ("is_active")`);

    await queryRunner.query(`
      CREATE TABLE "vehicle_documents" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "vehicle_id" UUID NOT NULL,
        "doc_type" VARCHAR(30) NOT NULL
          CONSTRAINT "CHK_vdocs_doc_type" CHECK (doc_type IN ('tech_passport_truck','tech_passport_trailer','passport','permit_kat','chip','other')),
        "file_key" VARCHAR(500) NOT NULL,
        "file_name" VARCHAR(255) NOT NULL,
        "mime_type" VARCHAR(100),
        "uploaded_by" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vehicle_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vdocs_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vdocs_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_vdocs_vehicle_id" ON "vehicle_documents" ("vehicle_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_vdocs_vehicle_id"`);
    await queryRunner.query(`DROP TABLE "vehicle_documents"`);

    await queryRunner.query(`DROP INDEX "idx_vehicles_is_active"`);
    await queryRunner.query(`DROP INDEX "idx_vehicles_carrier_id"`);
    await queryRunner.query(`DROP TABLE "vehicles"`);

    await queryRunner.query(`DROP INDEX "idx_loads_origin_point_id"`);
    await queryRunner.query(`DROP INDEX "idx_loads_status"`);
    await queryRunner.query(`DROP INDEX "idx_loads_shipper_id"`);
    await queryRunner.query(`DROP TABLE "loads"`);
  }
}
