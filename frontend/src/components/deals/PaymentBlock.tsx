import { useState } from 'react';
import { Alert, Button, Card, Image, Popconfirm, Space, Typography, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../../api/deals.api';
import UploadQrModal from './UploadQrModal';
import { paymentStatusLabel } from '../../utils/deal-status';
import type { Deal, Payment } from '../../types/deals.types';
import type { User } from '../../types';

const { Text } = Typography;

interface Props {
  deal: Deal;
  payment: Payment | undefined;
  viewer: User | null;
}

const amountFormatter = new Intl.NumberFormat('ru-RU');
function formatAmount(v: number | string | null | undefined) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return amountFormatter.format(n);
}

export default function PaymentBlock({ deal, payment, viewer }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const qc = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: () => dealsApi.confirmPayment(deal.id).then((r) => r.data),
    onSuccess: () => {
      message.success('Оплата подтверждена');
      qc.invalidateQueries({ queryKey: ['deal', deal.id] });
      qc.invalidateQueries({ queryKey: ['payment', deal.id] });
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось подтвердить оплату');
    },
  });

  const qrUrl = payment?.qrUrl ?? null;
  const role = viewer?.role;
  const amount = formatAmount(payment?.amount);

  const body = (() => {
    if (role === 'carrier') {
      return <Alert type="info" message="Расчёты ведутся между грузоотправителем и диспетчером." />;
    }
    if (role === 'shipper') {
      if (deal.status === 'cancelled') return <Alert type="error" message="Сделка отменена" />;
      if (deal.status === 'documents_revealed') {
        return <Alert type="success" message="Сделка раскрыта, документы доступны" />;
      }
      if (deal.status === 'paid') {
        return <Alert type="success" message="Оплата подтверждена" />;
      }
      if (!qrUrl) {
        return <Alert type="info" message="Ожидаем QR-код от диспетчера" />;
      }
      return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Image src={qrUrl} alt="QR-код" style={{ maxWidth: '100%' }} width={240} />
          <Text>Оплатите по QR-коду, диспетчер подтвердит платёж</Text>
          {amount && <Text strong>Сумма: {amount}</Text>}
        </Space>
      );
    }
    // dispatcher / admin
    const showConfirm = payment?.status === 'qr_sent' && deal.status === 'pending';
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {qrUrl ? (
          <>
            <Image src={qrUrl} alt="QR-код" style={{ maxWidth: '100%' }} width={240} />
            {amount && <Text>Сумма: {amount}</Text>}
            <Space wrap>
              <Button onClick={() => setUploadOpen(true)} disabled={deal.status !== 'pending'}>
                Заменить QR
              </Button>
              {showConfirm && (
                <Popconfirm
                  title="Подтвердить оплату?"
                  okText="Да"
                  cancelText="Нет"
                  onConfirm={() => confirmMutation.mutate()}
                >
                  <Button type="primary" loading={confirmMutation.isPending}>
                    Подтвердить оплату
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </>
        ) : (
          <>
            <Alert type="info" message="QR-код ещё не загружен" />
            <Button
              type="primary"
              onClick={() => setUploadOpen(true)}
              disabled={!payment || deal.status !== 'pending'}
            >
              Загрузить QR
            </Button>
          </>
        )}
        {payment && (
          <Text type="secondary">Статус оплаты: {paymentStatusLabel(payment.status)}</Text>
        )}
      </Space>
    );
  })();

  return (
    <Card title="Оплата">
      {body}
      <UploadQrModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        paymentId={payment?.id}
        dealId={deal.id}
      />
    </Card>
  );
}
