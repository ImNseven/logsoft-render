import { Avatar, Card, Col, Row, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Party {
  id?: string;
  full_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
}

interface Props {
  shipper?: Party;
  carrier?: Party;
  dispatcher?: Party;
}

function initials(name: string | null | undefined) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

function PartyTile({ title, p }: { title: string; p?: Party }) {
  const masked = !!p && !p.full_name && !p.company_name && !p.phone;
  return (
    <Card size="small" title={title} style={{ height: '100%' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar size={48} icon={<UserOutlined />}>
          {initials(p?.full_name)}
        </Avatar>
        <div style={{ minWidth: 0 }}>
          {masked ? (
            <Text type="secondary">Скрыто до раскрытия документов</Text>
          ) : (
            <>
              <div style={{ fontWeight: 500 }}>{p?.full_name || '—'}</div>
              {p?.company_name && (
                <Text type="secondary" style={{ display: 'block' }}>{p.company_name}</Text>
              )}
              {p?.phone ? (
                <a href={`tel:${p.phone}`}>{p.phone}</a>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Телефон скрыт
                </Text>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function PartiesCard({ shipper, carrier, dispatcher }: Props) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <PartyTile title="Грузоотправитель" p={shipper} />
      </Col>
      <Col xs={24} md={8}>
        <PartyTile title="Перевозчик" p={carrier} />
      </Col>
      <Col xs={24} md={8}>
        <PartyTile title="Диспетчер" p={dispatcher} />
      </Col>
    </Row>
  );
}
