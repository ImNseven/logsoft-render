import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../store/useAuthStore';
import { useVehicles } from '../../hooks/useVehicles';
import { vehiclesApi } from '../../api/vehicles.api';
import CreateVehicleModal from '../../components/vehicles/CreateVehicleModal';
import type { QueryVehiclesParams, Vehicle } from '../../types/vehicles.types';

const { Title } = Typography;

const ACTIVE_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'inactive', label: 'Неактивные' },
];

export default function VehiclesListPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isAdmin = !!user?.is_admin;
  const isDispatcherView = role === 'dispatcher' || isAdmin;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  );
  const [createOpen, setCreateOpen] = useState(false);

  const params: QueryVehiclesParams = useMemo(() => {
    const p: QueryVehiclesParams = { page, limit };
    if (activeFilter === 'active') p.isActive = true;
    if (activeFilter === 'inactive') p.isActive = false;
    return p;
  }, [page, limit, activeFilter]);

  const { data, isLoading, isFetching } = useVehicles(params, role, isAdmin);
  const qc = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.deactivate(id).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина деактивирована');
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ?? 'Не удалось деактивировать',
      );
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.activate(id).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина активирована');
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось активировать');
    },
  });

  const columns: ColumnsType<Vehicle> = [
    { title: 'Гос. номер', dataIndex: 'plateNumber', key: 'plateNumber' },
    {
      title: 'Тип транспорта',
      key: 'transportType',
      render: (_, r) => r.transportType?.name ?? '—',
    },
    {
      title: 'Грузоподъёмность (кг)',
      dataIndex: 'capacityKg',
      key: 'capacityKg',
      render: (v) => {
        if (v === null || v === undefined || v === '') return '—';
        const n = typeof v === 'string' ? Number(v) : v;
        return Number.isNaN(n) ? '—' : n.toLocaleString('ru-RU');
      },
    },
    {
      title: 'Характеристики',
      dataIndex: 'specs',
      key: 'specs',
      ellipsis: true,
      render: (v) => v ?? '—',
    },
    ...(isDispatcherView
      ? ([
          {
            title: 'Перевозчик',
            key: 'carrier',
            render: (_: unknown, r: Vehicle) =>
              r.carrier?.full_name ||
              r.carrier?.company_name ||
              r.carrier?.phone ||
              '—',
          },
        ] as ColumnsType<Vehicle>)
      : []),
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (a: boolean) =>
        a ? (
          <Badge status="success" text="Активна" />
        ) : (
          <Badge status="default" text="Неактивна" />
        ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 220,
      render: (_, r) => (
        <Space>
          <Link to={`/vehicles/${r.id}`}>
            <Button size="small">Открыть</Button>
          </Link>
          {r.isActive ? (
            <Popconfirm
              title="Деактивировать машину?"
              okText="Да"
              cancelText="Нет"
              okButtonProps={{ danger: true }}
              onConfirm={() => deactivateMutation.mutate(r.id)}
            >
              <Button size="small" danger>
                Деактивировать
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Активировать машину?"
              okText="Да"
              cancelText="Нет"
              onConfirm={() => activateMutation.mutate(r.id)}
            >
              <Button size="small" type="primary">
                Активировать
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {isDispatcherView ? 'Все машины' : 'Мои машины'}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Добавить машину
        </Button>
      </div>

      {isDispatcherView && (
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 180 }}
            value={activeFilter}
            onChange={(v) => {
              setPage(1);
              setActiveFilter(v);
            }}
            options={ACTIVE_OPTIONS}
          />
        </Space>
      )}

      <Table<Vehicle>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading || isFetching}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setLimit(ps);
          },
        }}
      />

      <CreateVehicleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Card>
  );
}
