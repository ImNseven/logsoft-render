import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Divider,
} from 'antd';
import {
  TeamOutlined,
  CarOutlined,
  TruckOutlined,
  DollarOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { AdminStats } from '../../types/admin.types';

const { Title, Text } = Typography;

function formatAmount(value: string) {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Line({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '4px 0',
        gap: 12,
      }}
    >
      <Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Text>
      <Text strong style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </div>
  );
}

function Block({
  icon,
  title,
  total,
  totalSize,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  total: number | string;
  totalSize?: number;
  children: React.ReactNode;
}) {
  return (
    <Card size="small" bordered styles={{ body: { padding: 16 } }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
          gap: 8,
        }}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          {icon} {title}
        </Text>
        <Text
          strong
          style={{
            fontSize: totalSize ?? 22,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {total}
        </Text>
      </div>
      <Divider style={{ margin: '4px 0 8px' }} />
      {children}
    </Card>
  );
}

function StatsGrid({ d, isMobile }: { d: AdminStats; isMobile: boolean }) {
  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12} md={8}>
        <Block icon={<TeamOutlined />} title="Пользователи" total={d.users.total}>
          <Line label="Грузоотправители" value={d.users.shippers} />
          <Line label="Перевозчики" value={d.users.carriers} />
          <Line label="Диспетчеры" value={d.users.dispatchers} />
          <Line label="Админы" value={d.users.admins} />
          <Line label="Деактивированы" value={d.users.inactive} />
        </Block>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Block icon={<CarOutlined />} title="Грузы" total={d.loads.total}>
          <Line label="Активные" value={d.loads.active} />
          <Line label="В сделке" value={d.loads.in_deal} />
          <Line label="Завершены" value={d.loads.completed} />
          <Line label="Отменены" value={d.loads.cancelled} />
        </Block>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Block icon={<DollarOutlined />} title="Сделки" total={d.deals.total}>
          <Line label="Ожидание оплаты" value={d.deals.pending} />
          <Line label="Оплачены" value={d.deals.paid} />
          <Line label="Документы раскрыты" value={d.deals.documents_revealed} />
          <Line label="Отменены" value={d.deals.cancelled} />
        </Block>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Block icon={<TruckOutlined />} title="Машины" total={d.vehicles.total}>
          <Line label="Активные" value={d.vehicles.active} />
          <Line label="Деактивированы" value={d.vehicles.inactive} />
        </Block>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Block
          icon={<CreditCardOutlined />}
          title="Оплаты"
          total={`${formatAmount(d.payments.confirmed_total_amount)} ₽`}
          totalSize={isMobile ? 18 : 20}
        >
          <Line label="Подтверждённых" value={d.payments.confirmed_count} />
        </Block>
      </Col>
    </Row>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminStats();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert type="error" message="Не удалось загрузить статистику" />;
  }

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ margin: 0, marginBottom: 16 }}>
        Сводка
      </Title>
      <StatsGrid d={data} isMobile={isMobile} />
    </div>
  );
}
