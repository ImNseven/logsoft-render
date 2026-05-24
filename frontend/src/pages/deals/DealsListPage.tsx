import { useMemo, useState } from 'react';
import { Button, Card, Empty, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '../../store/useAuthStore';
import { useDeals } from '../../hooks/useDeals';
import { dealStatusColor, dealStatusLabel } from '../../utils/deal-status';
import CreateDealModal from '../../components/deals/CreateDealModal';
import type { Deal, DealStatus, QueryDealsParams } from '../../types/deals.types';

const { Title } = Typography;

const STATUS_OPTIONS: { value: DealStatus; label: string }[] = [
  { value: 'pending', label: 'Ожидание оплаты' },
  { value: 'paid', label: 'Оплачено' },
  { value: 'documents_revealed', label: 'Документы раскрыты' },
  { value: 'cancelled', label: 'Отменено' },
];

function userName(u: { full_name?: string | null; company_name?: string | null; phone?: string | null } | undefined) {
  if (!u) return '—';
  return u.full_name || u.company_name || u.phone || '—';
}

export default function DealsListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isAdmin = !!user?.is_admin;
  const isDispatcherView = role === 'dispatcher' || isAdmin;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<DealStatus | undefined>();
  const [createOpen, setCreateOpen] = useState(false);

  const params: QueryDealsParams = useMemo(
    () => ({ page, limit, status }),
    [page, limit, status],
  );

  const { data, isLoading, isFetching } = useDeals(params, role, isAdmin);

  const columns: ColumnsType<Deal> = [
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Груз',
      key: 'load',
      render: (_, r) => {
        const origin = r.load?.originPoint?.name ?? '—';
        const dest = r.load?.destination ?? '—';
        return (
          <Space size={4} wrap>
            <span>{origin} → {dest}</span>
            {r.load?.transportType?.name && (
              <Tag color="geekblue">{r.load.transportType.name}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Машина',
      key: 'vehicle',
      render: (_, r) => {
        const plate = r.vehicle?.plateNumber ?? '—';
        const type = r.vehicle?.transportType?.name;
        return (
          <Space size={4} wrap>
            <span>{plate}</span>
            {type && <Tag>{type}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (s: DealStatus) => <Tag color={dealStatusColor(s)}>{dealStatusLabel(s)}</Tag>,
    },
    ...((isDispatcherView || role === 'carrier')
      ? ([
          {
            title: 'Грузоотправитель',
            key: 'shipper',
            render: (_: unknown, r: Deal) => userName(r.shipper as any),
          },
        ] as ColumnsType<Deal>)
      : []),
    ...((isDispatcherView || role === 'shipper')
      ? ([
          {
            title: 'Перевозчик',
            key: 'carrier',
            render: (_: unknown, r: Deal) => userName(r.carrier as any),
          },
        ] as ColumnsType<Deal>)
      : []),
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
          <DollarOutlined style={{ marginRight: 8 }} />
          {isDispatcherView ? 'Все сделки' : 'Мои сделки'}
        </Title>
        {isDispatcherView && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Создать сделку
          </Button>
        )}
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Статус"
          allowClear
          style={{ width: 220 }}
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
        />
      </Space>

      <Table<Deal>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading || isFetching}
        scroll={{ x: 1100 }}
        onRow={(record) => ({
          onClick: () => navigate(`/deals/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{ emptyText: <Empty description="Сделок пока нет" /> }}
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

      <CreateDealModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
}
