import { MigrationInterface, QueryRunner } from 'typeorm';

export class VehicleTypeAndCapacity1745942400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        ADD COLUMN "transport_type_id" INT NULL,
        ADD COLUMN "capacity_kg" DECIMAL(10,2) NULL,
        ADD CONSTRAINT "FK_vehicles_transport_type"
          FOREIGN KEY ("transport_type_id") REFERENCES "transport_types"("id")
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_vehicles_transport_type_id" ON "vehicles" ("transport_type_id")`,
    );

    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "vehicle_type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD COLUMN "vehicle_type" VARCHAR(100) NULL`,
    );
    await queryRunner.query(`DROP INDEX "idx_vehicles_transport_type_id"`);
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        DROP CONSTRAINT "FK_vehicles_transport_type",
        DROP COLUMN "transport_type_id",
        DROP COLUMN "capacity_kg"
    `);
  }
}
