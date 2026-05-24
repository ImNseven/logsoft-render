import { Modal, Form, Select, Input, Space, Tag, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { dealsApi } from '../../api/deals.api';
import { loadsApi } from '../../api/loads.api';
import { vehiclesApi } from '../../api/vehicles.api';
import type { CreateDealDto } from '../../types/deals.types';
import type { Load } from '../../types/loads.types';
import type { Vehicle } from '../../types/vehicles.types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function num(v: unknown) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString('ru-RU');
}

function loadSearchText(l: Load) {
  return [
    l.originPoint?.name,
    l.destination,
    l.transportType?.name,
    l.weightKg,
    l.volumeM3,
  ]
    .filter((x) => x !== null && x !== undefined && x !== '')
    .join(' ');
}

function vehicleSearchText(v: Vehicle) {
  return [v.plateNumber, v.transportType?.name, v.capacityKg, v.carrier?.full_name, v.carrier?.company_name]
    .filter((x) => x !== null && x !== undefined && x !== '')
    .join(' ');
}

function LoadOption({ load }: { load: Load }) {
  const weight = num(load.weightKg);
  const volume = num(load.volumeM3);
  const ready = load.readyDate ? dayjs(load.readyDate).format('DD.MM') : null;
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontWeight: 500 }}>
        {load.originPoint?.name ?? '—'} → {load.destination}
      </div>
      <Space size={4} wrap style={{ marginTop: 4 }}>
        {load.transportType?.name && <Tag color="blue">{load.transportType.name}</Tag>}
        {weight && <Tag>{weight} кг</Tag>}
        {volume && <Tag>{volume} м³</Tag>}
        {ready && <Tag color="geekblue">готов {ready}</Tag>}
      </Space>
    </div>
  );
}

function VehicleOption({ vehicle }: { vehicle: Vehicle }) {
  const capacity = num(vehicle.capacityKg);
  const carrier =
    vehicle.carrier?.full_name || vehicle.carrier?.company_name || null;
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontWeight: 500 }}>{vehicle.plateNumber}</div>
      <Space size={4} wrap style={{ marginTop: 4 }}>
        {vehicle.transportType?.name && <Tag color="blue">{vehicle.transportType.name}</Tag>}
        {capacity && <Tag>до {capacity} кг</Tag>}
        {carrier && <Tag color="default">{carrier}</Tag>}
      </Space>
    </div>
  );
}

export default function CreateDealModal({ open, onClose }: Props) {
  const [form] = Form.useForm<CreateDealDto>();
  const qc = useQueryClient();

  const loadsQ = useQuery({
    queryKey: ['loads', 'active-for-deal'],
    queryFn: () => loadsApi.getAll({ status: 'active', limit: 100 }).then((r) => r.data),
    enabled: open,
    staleTime: 30 * 1000,
  });

  const vehiclesQ = useQuery({
    queryKey: ['vehicles', 'active-for-deal'],
    queryFn: () => vehiclesApi.getAll({ isActive: true, limit: 100 }).then((r) => r.data),
    enabled: open,
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (dto: CreateDealDto) => dealsApi.create(dto).then((r) => r.data),
    onSuccess: () => {
      message.success('Сделка создана');
      qc.invalidateQueries({ queryKey: ['deals'] });
      qc.invalidateQueries({ queryKey: ['loads'] });
      form.resetFields();
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось создать сделку');
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    mutation.mutate(values);
  };

  const loadOptions = (loadsQ.data?.data ?? []).map((l) => ({
    value: l.id,
    label: `${l.originPoint?.name ?? '—'} → ${l.destination}`,
    search: loadSearchText(l),
    load: l,
  }));

  const vehicleOptions = (vehiclesQ.data?.data ?? []).map((v) => ({
    value: v.id,
    label: v.plateNumber,
    search: vehicleSearchText(v),
    vehicle: v,
  }));

  return (
    <Modal
      open={open}
      title="Создать сделку"
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Создать"
      cancelText="Отмена"
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <Form.Item
          name="loadId"
          label="Груз"
          rules={[{ required: true, message: 'Выберите груз' }]}
        >
          <Select
            showSearch
            optionFilterProp="search"
            loading={loadsQ.isLoading}
            options={loadOptions}
            placeholder="Активный груз"
            listHeight={360}
            optionRender={(opt) => <LoadOption load={(opt.data as any).load} />}
          />
        </Form.Item>
        <Form.Item
          name="vehicleId"
          label="Машина"
          rules={[{ required: true, message: 'Выберите машину' }]}
        >
          <Select
            showSearch
            optionFilterProp="search"
            loading={vehiclesQ.isLoading}
            options={vehicleOptions}
            placeholder="Активная машина"
            listHeight={360}
            optionRender={(opt) => <VehicleOption vehicle={(opt.data as any).vehicle} />}
          />
        </Form.Item>
        <Form.Item name="notes" label="Заметка для диспетчера (необязательно)">
          <Input.TextArea rows={3} maxLength={1000} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
