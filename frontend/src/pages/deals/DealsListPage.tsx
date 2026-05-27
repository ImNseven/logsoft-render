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
import MobileCardList from '../../components/common/MobileCardList';
import FilterBar from '../../components/common/FilterBar';
import { useIsMobile } from '../../hooks/useIsMobile';
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
  const isMobile = useIsMobile();

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

      <FilterBar
        activeCount={status ? 1 : 0}
        onReset={() => {
          setStatus(undefined);
          setPage(1);
        }}
      >
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
      </FilterBar>

      {isMobile ? (
        <MobileCardList<Deal>
          items={data?.data ?? []}
          rowKey={(d) => d.id}
          loading={isLoading || isFetching}
          emptyText="Сделок пока нет"
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total ?? 0,
            onChange: (p, ps) => { setPage(p); setLimit(ps); },
          }}
          renderCard={(r) => {
            const origin = r.load?.originPoint?.name ?? '—';
            const dest = r.load?.destination ?? '—';
            const transport = r.load?.transportType?.name;
            const plate = r.vehicle?.plateNumber;
            const showShipper = isDispatcherView || role === 'carrier';
            const showCarrier = isDispatcherView || role === 'shipper';
            return (
              <Card
                styles={{ body: { padding: 14 } }}
                style={{ borderRadius: 12, cursor: 'pointer' }}
                onClick={() => navigate(`/deals/${r.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <Typography.Text strong style={{ fontSize: 15, lineHeight: 1.3, flex: 1 }}>
                    {origin} → {dest}
                  </Typography.Text>
                  <Tag color={dealStatusColor(r.status)} style={{ margin: 0 }}>
                    {dealStatusLabel(r.status)}
                  </Tag>
                </div>
                <Space size={6} wrap style={{ marginBottom: 8 }}>
                  {transport && <Tag color="geekblue" style={{ margin: 0 }}>{transport}</Tag>}
                  {plate && <Tag style={{ margin: 0 }}>{plate}</Tag>}
                </Space>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                  Создана: <Typography.Text strong style={{ fontSize: 13 }}>{dayjs(r.createdAt).format('DD.MM.YYYY')}</Typography.Text>
                </div>
                {showShipper && (
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>
                    Грузоотпр.: <Typography.Text strong style={{ fontSize: 13 }}>{userName(r.shipper as any)}</Typography.Text>
                  </div>
                )}
                {showCarrier && (
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Перевозчик: <Typography.Text strong style={{ fontSize: 13 }}>{userName(r.carrier as any)}</Typography.Text>
                  </div>
                )}
              </Card>
            );
          }}
        />
      ) : (
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
      )}

      <CreateDealModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
}
