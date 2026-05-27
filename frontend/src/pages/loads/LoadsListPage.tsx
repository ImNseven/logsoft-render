import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useLoads,
  useOriginPoints,
  useTransportTypes,
} from '../../hooks/useLoads';
import { loadsApi } from '../../api/loads.api';
import CreateLoadModal from '../../components/loads/CreateLoadModal';
import EditLoadModal from '../../components/loads/EditLoadModal';
import MobileCardList from '../../components/common/MobileCardList';
import FilterBar from '../../components/common/FilterBar';
import { useIsMobile } from '../../hooks/useIsMobile';
import type {
  Load,
  LoadStatus,
  QueryLoadsParams,
} from '../../types/loads.types';

const { Title } = Typography;

const STATUS_LABEL: Record<LoadStatus, string> = {
  active: 'Активный',
  in_deal: 'В сделке',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

const STATUS_COLOR: Record<LoadStatus, string> = {
  active: 'green',
  in_deal: 'blue',
  completed: 'default',
  cancelled: 'red',
};

const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as LoadStatus[]).map((s) => ({
  value: s,
  label: STATUS_LABEL[s],
}));

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('ru-RU');
}

export default function LoadsListPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isAdmin = !!user?.is_admin;
  const isDispatcherView = role === 'dispatcher' || isAdmin;
  const isMobile = useIsMobile();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<LoadStatus | undefined>();
  const [originPointId, setOriginPointId] = useState<number | undefined>();
  const [transportTypeId, setTransportTypeId] = useState<number | undefined>();

  const [createOpen, setCreateOpen] = useState(false);
  const [editLoad, setEditLoad] = useState<Load | null>(null);

  const params: QueryLoadsParams = useMemo(
    () => ({
      page,
      limit,
      status,
      ...(isDispatcherView ? { originPointId, transportTypeId } : {}),
    }),
    [page, limit, status, originPointId, transportTypeId, isDispatcherView],
  );

  const { data, isLoading, isFetching } = useLoads(params, role, isAdmin);
  const { data: originPoints } = useOriginPoints();
  const { data: transportTypes } = useTransportTypes();
  const qc = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (id: string) => loadsApi.cancel(id).then((r) => r.data),
    onSuccess: () => {
      message.success('Груз отменён');
      qc.invalidateQueries({ queryKey: ['loads'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось отменить груз');
    },
  });

  const columns: ColumnsType<Load> = [
    {
      title: 'Пункт отправки',
      dataIndex: ['originPoint', 'name'],
      key: 'originPoint',
      render: (_, r) => r.originPoint?.name ?? '—',
    },
    { title: 'Направление', dataIndex: 'destination', key: 'destination' },
    {
      title: 'Тип транспорта',
      key: 'transportType',
      render: (_, r) => r.transportType?.name ?? '—',
    },
    {
      title: 'Вес (кг)',
      dataIndex: 'weightKg',
      key: 'weightKg',
      render: (v) => formatNumber(v),
    },
    {
      title: 'Объём (м³)',
      dataIndex: 'volumeM3',
      key: 'volumeM3',
      render: (v) => formatNumber(v),
    },
    {
      title: 'Дата готовности',
      dataIndex: 'readyDate',
      key: 'readyDate',
      render: (v: string | null) => (v ? dayjs(v).format('DD.MM.YYYY') : '—'),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: LoadStatus) => (
        <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>
      ),
    },
    ...(isDispatcherView
      ? ([
          {
            title: 'Грузоотправитель',
            key: 'shipper',
            render: (_: unknown, r: Load) =>
              r.shipper?.full_name ||
              r.shipper?.company_name ||
              r.shipper?.phone ||
              '—',
          },
        ] as ColumnsType<Load>)
      : []),
    {
      title: 'Действия',
      key: 'actions',
      width: 220,
      render: (_, r) => {
        if (r.status !== 'active') return null;
        return (
          <Space>
            <Button size="small" onClick={() => setEditLoad(r)}>
              Редактировать
            </Button>
            <Popconfirm
              title="Отменить груз?"
              description="Это действие нельзя отменить"
              okText="Да"
              cancelText="Нет"
              okButtonProps={{ danger: true }}
              onConfirm={() => cancelMutation.mutate(r.id)}
            >
              <Button size="small" danger>
                Отменить
              </Button>
            </Popconfirm>
          </Space>
        );
      },
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
          {isDispatcherView ? 'Все грузы' : 'Мои грузы'}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Создать груз
        </Button>
      </div>

      <FilterBar
        activeCount={
          (status ? 1 : 0) +
          (isDispatcherView && originPointId ? 1 : 0) +
          (isDispatcherView && transportTypeId ? 1 : 0)
        }
        onReset={() => {
          setStatus(undefined);
          setOriginPointId(undefined);
          setTransportTypeId(undefined);
          setPage(1);
        }}
      >
        <Select
          placeholder="Статус"
          allowClear
          style={{ width: 180 }}
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
        />
        {isDispatcherView && (
          <>
            <Select
              placeholder="Пункт отправки"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
              options={(originPoints ?? []).map((p) => ({
                value: p.id,
                label: p.name,
              }))}
              value={originPointId}
              onChange={(v) => {
                setPage(1);
                setOriginPointId(v);
              }}
            />
            <Select
              placeholder="Тип транспорта"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
              options={(transportTypes ?? []).map((t) => ({
                value: t.id,
                label: t.name,
              }))}
              value={transportTypeId}
              onChange={(v) => {
                setPage(1);
                setTransportTypeId(v);
              }}
            />
          </>
        )}
      </FilterBar>

      {isMobile ? (
        <MobileCardList<Load>
          items={data?.data ?? []}
          rowKey={(l) => l.id}
          loading={isLoading || isFetching}
          emptyText="Грузов пока нет"
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total ?? 0,
            onChange: (p, ps) => { setPage(p); setLimit(ps); },
          }}
          renderCard={(r) => {
            const weight = formatNumber(r.weightKg);
            const volume = formatNumber(r.volumeM3);
            const ready = r.readyDate ? dayjs(r.readyDate).format('DD.MM.YYYY') : null;
            const shipper = isDispatcherView
              ? r.shipper?.full_name || r.shipper?.company_name || r.shipper?.phone
              : null;
            return (
              <Card styles={{ body: { padding: 14 } }} style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <Typography.Text strong style={{ fontSize: 15, lineHeight: 1.3, flex: 1 }}>
                    {r.originPoint?.name ?? '—'} → {r.destination}
                  </Typography.Text>
                  <Tag color={STATUS_COLOR[r.status]} style={{ margin: 0 }}>
                    {STATUS_LABEL[r.status]}
                  </Tag>
                </div>
                <Space size={6} wrap style={{ marginBottom: 8 }}>
                  {r.transportType?.name && <Tag color="blue" style={{ margin: 0 }}>{r.transportType.name}</Tag>}
                  {weight !== '—' && <Tag style={{ margin: 0 }}>{weight} кг</Tag>}
                  {volume !== '—' && <Tag style={{ margin: 0 }}>{volume} м³</Tag>}
                </Space>
                {ready && (
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                    Готов: <Typography.Text strong style={{ fontSize: 13 }}>{ready}</Typography.Text>
                  </div>
                )}
                {shipper && (
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Грузоотправитель: <Typography.Text strong style={{ fontSize: 13 }}>{shipper}</Typography.Text>
                  </div>
                )}
                {r.status === 'active' && (
                  <Space style={{ width: '100%', marginTop: 12 }} size={8}>
                    <Button style={{ flex: 1 }} block onClick={() => setEditLoad(r)}>
                      Редактировать
                    </Button>
                    <Popconfirm
                      title="Отменить груз?"
                      description="Это действие нельзя отменить"
                      okText="Да"
                      cancelText="Нет"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => cancelMutation.mutate(r.id)}
                    >
                      <Button style={{ flex: 1 }} block danger>Отменить</Button>
                    </Popconfirm>
                  </Space>
                )}
              </Card>
            );
          }}
        />
      ) : (
        <Table<Load>
          rowKey="id"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isLoading || isFetching}
          scroll={{ x: 1100 }}
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
      )}

      <CreateLoadModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditLoadModal
        open={!!editLoad}
        load={editLoad}
        onClose={() => setEditLoad(null)}
      />
    </Card>
  );
}
