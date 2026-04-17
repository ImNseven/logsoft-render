import { Card, Col, Row, Typography } from 'antd';
import {
  InboxOutlined,
  CarOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';

const { Title, Text } = Typography;

const ROLE_CARDS: Record<string, Array<{ title: string; icon: React.ReactNode }>> = {
  shipper: [
    { title: 'Мои грузы', icon: <InboxOutlined style={{ fontSize: 32, color: '#1677ff' }} /> },
    { title: 'Мои сделки', icon: <FileTextOutlined style={{ fontSize: 32, color: '#1677ff' }} /> },
  ],
  carrier: [
    { title: 'Мои машины', icon: <CarOutlined style={{ fontSize: 32, color: '#52c41a' }} /> },
    { title: 'Мои сделки', icon: <FileTextOutlined style={{ fontSize: 32, color: '#52c41a' }} /> },
  ],
  dispatcher: [
    { title: 'Все грузы', icon: <InboxOutlined style={{ fontSize: 32, color: '#fa8c16' }} /> },
    { title: 'Все машины', icon: <CarOutlined style={{ fontSize: 32, color: '#fa8c16' }} /> },
    { title: 'Сделки', icon: <FileTextOutlined style={{ fontSize: 32, color: '#fa8c16' }} /> },
    { title: 'Пользователи', icon: <TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} /> },
  ],
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const cards = user ? ROLE_CARDS[user.role] || [] : [];

  return (
    <div>
      <Title level={4}>
        Добро пожаловать, {user?.full_name || user?.phone}!
      </Title>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {cards.map((card) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={card.title}>
            <Card hoverable style={{ textAlign: 'center', minHeight: 160 }}>
              <div style={{ marginBottom: 16 }}>{card.icon}</div>
              <Title level={5} style={{ margin: 0 }}>{card.title}</Title>
              <Text type="secondary">Скоро</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
