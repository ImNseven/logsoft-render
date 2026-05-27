import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Popconfirm,
  Result,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { dealsApi } from '../../api/deals.api';
import { paymentsApi } from '../../api/payments.api';
import { useAuthStore } from '../../store/useAuthStore';
import { dealStatusColor, dealStatusLabel } from '../../utils/deal-status';
import {
  canCancel,
  canConfirmPayment,
  canDownloadDoc,
  canReplaceVehicle,
  canReveal,
} from '../../utils/deal-permissions';
import PartiesCard from '../../components/deals/PartiesCard';
import LoadInfoCard from '../../components/deals/LoadInfoCard';
import VehicleInfoCard from '../../components/deals/VehicleInfoCard';
import PaymentBlock from '../../components/deals/PaymentBlock';
import DealDocumentsList from '../../components/deals/DealDocumentsList';
import ReplaceVehicleModal from '../../components/deals/ReplaceVehicleModal';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Title, Text } = Typography;

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const isMobile = useIsMobile();

  const [replaceOpen, setReplaceOpen] = useState(false);

  const dealQ = useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealsApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const deal = dealQ.data;

  const paymentQ = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsApi.getByDeal(id!).then((r) => r.data),
    enabled: !!deal && user?.role !== 'carrier',
    retry: false,
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['deal', id] });
    qc.invalidateQueries({ queryKey: ['payment', id] });
    qc.invalidateQueries({ queryKey: ['deals'] });
  };

  const revealMutation = useMutation({
    mutationFn: () => dealsApi.reveal(id!).then((r) => r.data),
    onSuccess: () => { message.success('Документы раскрыты'); invalidateAll(); },
    onError: (err: any) => message.error(err?.response?.data?.message ?? 'Не удалось раскрыть документы'),
  });

  const confirmMutation = useMutation({
    mutationFn: () => dealsApi.confirmPayment(id!).then((r) => r.data),
    onSuccess: () => { message.success('Оплата подтверждена'); invalidateAll(); },
    onError: (err: any) => message.error(err?.response?.data?.message ?? 'Не удалось подтвердить оплату'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => dealsApi.cancel(id!).then((r) => r.data),
    onSuccess: () => {
      message.success('Сделка отменена');
      invalidateAll();
      qc.invalidateQueries({ queryKey: ['loads'] });
    },
    onError: (err: any) => message.error(err?.response?.data?.message ?? 'Не удалось отменить сделку'),
  });

  if (dealQ.isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (dealQ.isError || !deal) {
    const status = (dealQ.error as any)?.response?.status;
    return (
      <Result
        status={status === 403 ? '403' : '404'}
        title={status === 403 ? 'Нет доступа к сделке' : 'Сделка не найдена'}
        extra={
          <Button type="primary" onClick={() => navigate('/deals')}>
            К списку сделок
          </Button>
        }
      />
    );
  }

  const downloadAllowed = canDownloadDoc(deal, user);
  const showConfirm = canConfirmPayment(deal, user);
  const showReveal = canReveal(deal, user);
  const showReplace = canReplaceVehicle(deal, user);
  const showCancel = canCancel(deal, user);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/deals">Сделки</Link> },
          { title: `#${deal.id.slice(0, 8)}` },
        ]}
      />

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: 16,
            gap: 12,
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
          }}
        >
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/deals')}>
              Назад
            </Button>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Сделка #{deal.id.slice(0, 8)}</Title>
            <Tag color={dealStatusColor(deal.status)}>{dealStatusLabel(deal.status)}</Tag>
            <Text type="secondary">от {dayjs(deal.createdAt).format('DD.MM.YYYY')}</Text>
          </Space>
          <Space
            wrap={!isMobile}
            direction={isMobile ? 'vertical' : 'horizontal'}
            style={isMobile ? { width: '100%' } : undefined}
            size={isMobile ? 8 : undefined}
          >
            {showConfirm && (
              <Popconfirm
                title="Подтвердить оплату?"
                okText="Да"
                cancelText="Нет"
                onConfirm={() => confirmMutation.mutate()}
              >
                <Button block={isMobile} type="primary" icon={<CheckCircleOutlined />} loading={confirmMutation.isPending}>
                  Подтвердить оплату
                </Button>
              </Popconfirm>
            )}
            {showReveal && (
              <Popconfirm
                title="Раскрыть документы?"
                description="После этого действия нельзя будет отменить сделку или заменить машину."
                okText="Да"
                cancelText="Нет"
                onConfirm={() => revealMutation.mutate()}
              >
                <Button block={isMobile} type="primary" icon={<EyeOutlined />} loading={revealMutation.isPending}>
                  Раскрыть документы
                </Button>
              </Popconfirm>
            )}
            {showReplace && (
              <Button block={isMobile} icon={<SwapOutlined />} onClick={() => setReplaceOpen(true)}>
                Заменить машину
              </Button>
            )}
            {showCancel && (
              <Popconfirm
                title="Отменить сделку?"
                description="Груз вернётся в статус «Активный»."
                okText="Да"
                cancelText="Нет"
                okButtonProps={{ danger: true }}
                onConfirm={() => cancelMutation.mutate()}
              >
                <Button block={isMobile} danger icon={<StopOutlined />} loading={cancelMutation.isPending}>
                  Отменить сделку
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}><LoadInfoCard load={deal.load} /></Col>
        <Col xs={24} md={12}><VehicleInfoCard vehicle={deal.vehicle} /></Col>
      </Row>

      <PartiesCard
        shipper={deal.shipper}
        carrier={deal.carrier}
        dispatcher={deal.dispatcher}
      />

      <PaymentBlock deal={deal} payment={paymentQ.data} viewer={user} />

      <DealDocumentsList vehicleId={deal.vehicle?.id} canDownload={downloadAllowed} />

      {deal.vehicle?.id && (
        <ReplaceVehicleModal
          open={replaceOpen}
          onClose={() => setReplaceOpen(false)}
          dealId={deal.id}
          currentVehicleId={deal.vehicle.id}
        />
      )}
    </Space>
  );
}
