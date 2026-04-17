import { DataSource } from 'typeorm';
import { TransportType } from '../../modules/transport-types/entities/transport-type.entity';

const TRANSPORT_TYPES = [
  'Тент с прицепом',
  'Тент полуприцеп (92-105 м3)',
  'Тент юмба',
  'Тент 120 м3',
  'Тент 120, 130, 140, 150 м3 (тандем)',
  'Площадка 13,5 м',
  'Площадка 17 м',
  'Трал (удлинитель)',
  'Трал низкорамный (вес устанавливается вручную)',
  'Рефрижератор',
];

export async function seedTransportTypes(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(TransportType);

  for (const name of TRANSPORT_TYPES) {
    const existing = await repo.findOneBy({ name });
    if (existing) continue;

    await repo.save(repo.create({ name }));
  }
}
