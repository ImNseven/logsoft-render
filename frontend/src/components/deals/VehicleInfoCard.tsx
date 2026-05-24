import { Card, Descriptions } from 'antd';
import type { Vehicle } from '../../types/vehicles.types';

interface Props {
  vehicle?: Vehicle;
}

function num(v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('ru-RU');
}

export default function VehicleInfoCard({ vehicle }: Props) {
  return (
    <Card title="Машина" size="small" style={{ height: '100%' }}>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Гос. номер">{vehicle?.plateNumber ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Тип транспорта">
          {vehicle?.transportType?.name ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Грузоподъёмность (кг)">
          {num(vehicle?.capacityKg)}
        </Descriptions.Item>
        <Descriptions.Item label="Характеристики">{vehicle?.specs || '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
