import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { seedAdmin } from './admin.seed';
import { seedOriginPoints } from './origin-points.seed';
import { seedTransportTypes } from './transport-types.seed';

async function main() {
  await AppDataSource.initialize();

  await seedAdmin(AppDataSource);
  await seedOriginPoints(AppDataSource);
  await seedTransportTypes(AppDataSource);

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
