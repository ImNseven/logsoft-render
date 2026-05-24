import { Card, Descriptions } from 'antd';
import dayjs from 'dayjs';
import type { Load } from '../../types/loads.types';

interface Props {
  load?: Load;
}

function num(v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('ru-RU');
}

export default function LoadInfoCard({ load }: Props) {
  return (
    <Card title="Груз" size="small" style={{ height: '100%' }}>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Пункт отправки">
          {load?.originPoint?.name ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Направление">{load?.destination ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Тип транспорта">
          {load?.transportType?.name ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Вес (кг)">{num(load?.weightKg)}</Descriptions.Item>
        <Descriptions.Item label="Объём (м³)">{num(load?.volumeM3)}</Descriptions.Item>
        <Descriptions.Item label="Дата готовности">
          {load?.readyDate ? dayjs(load.readyDate).format('DD.MM.YYYY') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Примечания">{load?.notes || '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
