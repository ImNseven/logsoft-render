import { DataSource } from 'typeorm';
import { OriginPoint } from '../../modules/origin-points/entities/origin-point.entity';

const ORIGIN_POINTS = ['Алматы', 'Астана', 'Урумчи', 'Хоргос', 'Шымкент'];

export async function seedOriginPoints(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(OriginPoint);

  for (const name of ORIGIN_POINTS) {
    const existing = await repo.findOneBy({ name });
    if (existing) continue;

    await repo.save(repo.create({ name }));
  }
}
